// TO DEPLOY ON BLUEMIX MANUALLY
// NODE_ENV=production SERVICE=Blockchain-bp DEPLOYANDEXIT=true GOPATH=$(pwd) GPRC_TRACE=all DEBUG=hfc node app.js
"use strict";
const hfc = require('hfc');
//const hfc = require('./hfc-patched'); // !!!
const fs = require('fs-extra');
const logger = require('../utils/logger');
const config = require('./chaincodeconfig');
const testData = require('../testdata');

const chaincodeFilename = 'chaincode.go';
const chaincodeIdFile = 'chaincode_id';
const keyValStore = 'keyValStore';

const onBluemix = process.env.NODE_ENV == "production";
if(onBluemix) process.env.GOPATH = __dirname + '/..'; // YOLO

const ca = config.network.ca[Object.keys(config.network.ca)[0]];
const peer = config.network.peers[0];

const fullChaincodePath = process.env.GOPATH + "/src/" + config.chaincode.projectName;
const chaincodeIdPath = config.chaincode.deployed_dir+"/"+chaincodeIdFile;
const keyValStorePath = config.chaincode.deployed_dir+"/"+keyValStore+ (onBluemix ? '-' + ca.url.substring(0, 8) : '');

const certificatePath = "/certs/peer/cert.pem"; // for blockchain service on network ids without dashes
// otherwise "/certs/blockchain-cert.pem"

var chain, chaincodeID, afterDeploymentCallback;

// Initialize blockchain.
exports.init = function(callback) {
    afterDeploymentCallback = callback;
    logger.info("[SDK] Initializing the blockchain");
    logger.info("[SDK] $GOPATH:", process.env.GOPATH);

    init();
};

function init() {

    // Create a client chain. The name can be anything as it is only used internally.
    chain = hfc.newChain("chain-network");
    chain.setKeyValStore(hfc.newFileKeyValStore(keyValStorePath));

    if (onBluemix){
        logger.info("[SDK] Running in bluemix mode");
        chain.setDevMode(false);
        chain.setECDSAModeForGRPC(true);
        chain.setDeployWaitTime(180);
        chain.setInvokeWaitTime(5);

        process.env['GRPC_SSL_CIPHER_SUITES'] = 'ECDHE-RSA-AES128-GCM-SHA256:' +
            'ECDHE-RSA-AES128-SHA256:' +
            'ECDHE-RSA-AES256-SHA384:' +
            'ECDHE-RSA-AES256-GCM-SHA384:' +
            'ECDHE-ECDSA-AES128-GCM-SHA256:' +
            'ECDHE-ECDSA-AES128-SHA256:' +
            'ECDHE-ECDSA-AES256-SHA384:' +
            'ECDHE-ECDSA-AES256-GCM-SHA384';

        // Get the tls certificate, needed to connect to the Bluemix Blockchain service
        var cert = fs.readFileSync(config.chaincode.deployed_dir + '/certificate.pem');

        // Connect to memberservice and peer
        chain.setMemberServicesUrl("grpcs://"+ca.url, {pem:cert});
        logger.debug("[SDK] CA:", "grpc://"+ca.url);

        // Add all peers
        config.network.peers.forEach(function(p){
           chain.addPeer("grpcs://"+p.discovery_host+":"+p.discovery_port, {pem:cert});
            logger.debug("[SDK] Peer:", "grpc://"+p.discovery_host+":"+p.discovery_port);
        });
    } else {
        logger.info("[SDK] Running in local mode");
        chain.setMemberServicesUrl("grpc://"+ca.url);
        logger.debug("[SDK] CA:", "grpc://"+ca.url);
        chain.addPeer("grpc://"+peer.discovery_host+":"+peer.discovery_port);
        logger.debug("[SDK] Peer:", "grpc://"+peer.discovery_host+":"+peer.discovery_port);
    }

    logger.info("[SDK] Connected to memberservice and peer");

    registerAdmin();
}

var registerAdmin = function(){

    // Enroll "WebAppAdmin" which is already registered because it is
    // listed in fabric/membersrvc/membersrvc.yaml with it's one time password.
    chain.enroll(config.chaincode.webAppAdmin.enrollId, config.chaincode.webAppAdmin.enrollSecret, function(err, webAppAdmin) {
        if (err) return logger.error("[SDK] Failed to register WebAppAdmin", config.chaincode.webAppAdmin.enrollId, config.chaincode.webAppAdmin.enrollSecret, err);

        logger.info("[SDK] Successfully registered WebAppAdmin");

        // Set WebAppAdmin as the chain's registrar which is authorized to register other users.
        chain.setRegistrar(webAppAdmin);

        // Register and enroll the users
        registerUsers();

        // Deploy the chaincode
        deployChaincode();
    });
};

// Register the users
var registerUsers = function(){

    logger.info("[SDK] Going to register users");

    // Register and enroll all the user that are in the chaincodeconfig.js
    config.network.app_users.forEach(function(user) {

        chain.getUser(user.id, function (err, userObject) {
            if (err) return logger.error("[SDK] Error getting user ",user.id, err);
            if (userObject.isEnrolled()) return logger.info("[SDK] User "+ user.id +" is already enrolled");
            if (userObject.isRegistered()) {
                logger.warning("[SDK] User "+ user.id +" is already registered but not enrolled.");
            }

            // User is not enrolled yet, so perform both registration and enrollment
            var registrationRequest = {
                enrollmentID: user.id,
                affiliation: onBluemix ? "group1" : "institution_a",
                account: onBluemix ? "group1" : ""
            };

            chain.registerAndEnroll(registrationRequest, function (err) {
                if (err) return logger.error("[SDK] Error registering and enrolling user",user.id, err);
                logger.info("[SDK] User "+ user.id +" successfully registered and enrolled");
            });
        });
    });
};

// Store chaincode id for later use (so we don't have to redeploy).
var saveChaincodeId = function(id) {
    chaincodeID = id;
    logger.debug('Saving chaincode id', id);
    fs.writeFile(chaincodeIdPath, id);
};

// Get chaincode id from file or env
var loadChaincodeId = function(cb){
    // An environment variable overrules the file.
    if (process.env.CHAINCODE_ID) {
        logger.debug("Found chaincode id from environment variable:", process.env.CHAINCODE_ID);
        return cb(null, process.env.CHAINCODE_ID);
    }

    fs.readFile(chaincodeIdPath, function read(err, data) {
        var chaincodeIdFromFile = data ? data.toString() : null;
        logger.debug("Found chaincode id from file:", chaincodeIdFromFile);
        return cb(err, chaincodeIdFromFile);
    });
};


// Function to deploy the chaincode
var deployChaincode = function(forceRedeploy){
        logger.debug("[SDK] Checking if redeploy is needed");
        // Load the previously deployed chaincode
        loadChaincodeId(function (err, chaincodeIdFromEnv) {
            chaincodeID = chaincodeIdFromEnv;

            if (!chaincodeIdFromEnv || forceRedeploy) {

                logger.debug("[SDK] Going to deploy chaincode");

                // Including a unique string as an argument to make sure each new deploy has a unique id
                var deployRequest = {
                    fcn: "init",
                    args: [new Date().getTime().toString()],
                    chaincodePath: config.chaincode.projectName // Path to the global directory containing the chaincode project under $GOPATH/src/
                };

                if(onBluemix) deployRequest.certificatePath = certificatePath;

                var webAppAdmin = chain.getRegistrar();

                // Deploy the chaincode
                var deployTx = webAppAdmin.deploy(deployRequest);
                deployTx.on("complete", function (results) {
                    logger.debug("[SDK] Successfully deployed chaincode");
                    logger.debug("[SDK] Deploy result: ", results);

                    afterDeployment(results.chaincodeID, true);
                });
                deployTx.on("error", function (err) {
                    logger.error("[SDK] Failed to deploy chaincode");
                    logger.error("[SDK] Deploy error: ", err);
                    if(typeof afterDeploymentCallback == 'function') {
                        afterDeploymentCallback('Deploy error.');
                    }
                });
            } else {
                logger.info("[SDK] Using previously deployed chaincode: " + chaincodeIdFromEnv);

                afterDeployment(chaincodeIdFromEnv);
            }
        });
   // }
};


// Save details for deployed code
var afterDeployment = function(newChaincodeID, invokeTestData) {
    // store dhaincodeID in a file
    saveChaincodeId(newChaincodeID);
    if (!onBluemix && config.chaincode.autoRedeploy){
        // Start watching the chaincode for changes
        if (config.chaincode.autoRedeploy) watchChaincode();
    }

    logger.info("[SDK] Done.");

    // Place test data on blockchain
    if(invokeTestData && typeof afterDeploymentCallback === 'function') {
        logger.info("[SDK] Calling callback...");
        afterDeploymentCallback();
    }
};


// Watch filesystem for changes in the local chaincode and copy the file to the folder inside the $GOPATH
var fsTimeout;
var watchChaincode = function() {
    watchPath(fullChaincodePath + '/' + chaincodeFilename);
    watchPath(fullChaincodePath + '/data/');
    watchPath(fullChaincodePath + '/invoke/');
    watchPath(fullChaincodePath + '/query/');
    watchPath(fullChaincodePath + '/utils/');
    logger.info("[SDK] Watching " + fullChaincodePath + " for changes...");
};

var watchPath = function(path) {
    fs.watch(path, function(eventType, filename){
        if (!fsTimeout){
            fsTimeout = setTimeout(function() { fsTimeout=null }, 5000);
            logger.debug("[SDK] Chaincode changed. Redeploying...");
            deployChaincode(true);
        }
    });
}

// Function to get the user
var getUser = function(userName, cb) {
    chain.getUser(userName, function (err, user) {
        if (err) return cb(err);
        if (user.isEnrolled()) return cb(null, user);
        return cb("user is not yet registered and enrolled");
    });
};

// Execute a invoke request
exports.invoke = function (fcn, args, enrollmentId, cb) {
    if(typeof cb !== 'function') cb = function(){};

    getUser(enrollmentId, function (err, user, userCert) {
        if (err) {
            logger.error("[SDK] Failed to get " + enrollmentId + " ---> ", err);
            return cb(err);
        }

        // Issue an invoke request
        var invokeRequest = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args
        };

        // Invoke the request from the user object.
        var tx = user.invoke(invokeRequest);

        tx.on("submitted", function(results) {
            logger.debug("[SDK] "+ enrollmentId +" submitted invoke function "+ fcn, args[0]);
        });
        tx.on("complete", function(results) {
            cb(null, results);
        });
        tx.on("error", function(err) {
            logger.error("[SDK] error on invoke:",err);
            cb(err);
        });
    });
};


// Execute a query request
exports.query = function(fcn, args, enrollmentId, cb) {
    getUser(enrollmentId, function (err, user, userCert) {
        if (err) {
            logger.error("[SDK] Failed to get " + enrollmentId + " ---> ", err);
            cb(err);
        } else {
            // Issue a query request
            var queryRequest = {
                chaincodeID: chaincodeID,
                fcn: fcn,
                args: args
            };

            // Trigger the query from the user object.
            var tx = user.query(queryRequest);
            tx.on("submitted", function(results) {
                logger.debug("[SDK] "+ enrollmentId +" submitted query function "+ fcn);
            });
            tx.on("complete", function(results) {
                logger.info("[SDK] completed query:",fcn);
                if(results) cb(null, JSON.parse(results.result));
                else cb('Empty result', results);
            });
            tx.on("error", function(err) {
                logger.error("[SDK] error on query:",err);
                cb(err)
            });
        }
    });
};
