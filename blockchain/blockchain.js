'use strict';

var hfc = require('hfc');
var fs = require('fs-extra');
var crypto = require('crypto');
var logger = require('../utils/logger');
var config = require('./chaincodeconfig');
var testData = require('../testdata/testData.js');

var chain, chaincodeID, onBluemix;
var chaincodePath = process.env.GOPATH + "/src/" + config.chaincode.projectName;
var certFilename = 'certificate.pem';
var chaincodeFilename = 'chaincode.go';
var chaincodeIdFile = 'chaincode_id';


// Initialize blockchain.
exports.init = function(){
    logger.info("[SDK] Initializing the blockchain");

    // Creating a local chain object
    chain = hfc.newChain("chain-network");

    // Setting the memberservice and peer urls
    var ca = config.network.ca[Object.keys(config.network.ca)[0]];
    var peer = config.network.peers[0];

    // Check if we are running on bluemix or local
    if (process.env.NODE_ENV == "production"){
        logger.info("[SDK] Running in bluemix mode");
        onBluemix = true;
    } else {
        logger.info("[SDK] Running in local mode");
        onBluemix = false;
    }

    // Connecting to memberservice and peer and setting key store depending in which environment we are
    if (onBluemix){

        // Set the key value store that holds the user certifictes
        chain.setKeyValStore(hfc.newFileKeyValStore('blockchain/deployBluemix/keyValueStore'));

        chain.setECDSAModeForGRPC(true);
        chain.setDevMode(false);

        // Get the tls certificate, needed to connect to the Bluemix Blockchain service
        var cert = fs.readFileSync('src/' + config.chaincode.projectName + '/' + certFilename);

        // Connect to memberservice and peer
        chain.setMemberServicesUrl("grpcs://"+ca.url,{pem:cert});
        chain.addPeer("grpcs://"+peer.discovery_host+":"+peer.discovery_port,{pem:cert});

    } else {

        // Set the key value store that holds the user certifictes
        chain.setKeyValStore(hfc.newFileKeyValStore('blockchain/deployLocal/keyValueStore'));

        // Connect to memberservice and peer
        chain.setMemberServicesUrl("grpc://"+ca.url);
        chain.addPeer("grpc://"+peer.discovery_host+":"+peer.discovery_port);
    }

    logger.info("[SDK] Connected to memberservice and peer");

    registerAdmin();
};

// Register Admin user
var registerAdmin = function(){

    // Getting admin user
    var adminUser;
    for (var i= 0;i<config.network.users.length;i++){
        if (config.network.users[i].enrollId == "WebAppAdmin"){
            adminUser = config.network.users[i];
            break
        }
    }

    // Enroll admin user which is already registered because it is
    // listed in fabric/membersrvc/membersrvc.yaml with it's one time password.
    chain.enroll(adminUser.enrollId, adminUser.enrollSecret, function(err, webAppAdmin) {
       if (err) {
           logger.error("[SDK] Failed to register WebAppAdmin, ", err);
       } else {
           logger.info("[SDK] Successfully registered WebAppAdmin");

           // Set WebAppAdmin as the chain's registrar which is authorized to register other users.
           chain.setRegistrar(webAppAdmin);

           // Register and enroll the users
           registerUsers();

           // Deploy the chaincode
           deployChaincode();
       }

    });

};

// Register the users
var registerUsers = function(){

    logger.info("[SDK] Going to register users");

    // Register and enroll all the user that are in the chaincodeconfig.js
    config.network.app_users.forEach(function(user) {

        chain.getUser(user.userId, function (err, userObject) {
            if (err) {
                logger.error("[SDK] Error getting user ",user.userId);
                logger.info(err)
            } else if (userObject.isEnrolled()) {
                logger.info("[SDK] User "+ user.userId +" is already enrolled")
            } else {

                // User is not enrolled yet, so perform both registration and enrollment
                var registrationRequest = {
                    enrollmentID: user.userId,
                    affiliation: "institution_a",
                    account: ""
                };
                chain.registerAndEnroll(registrationRequest, function (err) {
                    if (err) {
                        logger.error("[SDK] Error registering and enrolling user",user.userId);
                        logger.info(err)
                    } else {
                        logger.info("[SDK] User "+ user.userId +" successfully registered and enrolled");
                    }
                });
            }
        });

    })
};

// Store chaincode id for later use (so we don't have to redeploy).
var saveLatestDeployed = function() {
	fs.writeFile('blockchain/deployLocal/' + chaincodeIdFile, chaincodeID);
};

// Get chaincode id from file
var loadLatestDeployed = function(cb){

    // Get the path to the latestDeployed file
    var path;
    if(onBluemix){
        path = 'blockchain/deployBluemix/' + chaincodeIdFile
    } else {
        path = 'blockchain/deployLocal/' + chaincodeIdFile
    }

    // Read the chaincodeId from the latest deployed file
    fs.readFile(path, function read(err, data) {
        var latestDeployed = data ? data.toString() : null;
        return cb(latestDeployed);
    });

};

// Generate a unique string
var createHash = function(){
    var md5 = crypto.createHash('md5');
    md5.update(new Date().getTime().toString());
    return md5.digest('base64').toString();
};

// Function to get the user
var getUser = function(userName, cb) {

    chain.getUser(userName, function (err, user) {
        if (err) {
            return cb(err);
        } else if (user.isEnrolled()) {
            return cb(null, user)
        } else {
            return cb("user is not yet registered and enrolled")
        }
    });
};

// Function to deploy the chaincode
var deployChaincode = function(forceRedeploy){

    if (onBluemix){

        loadLatestDeployed(function(latestDeployed){
            config.chaincode.deployed_name = latestDeployed;
            afterDeployment(config.chaincode.deployed_name, true)
        })

    } else {

        // We are running locally
        logger.info("[SDK] Checking if redeploy is needed");

        // Load the previously deployed chaincode
        loadLatestDeployed(function(latestDeployed){

            // Don't overwrite the deployed_name if it's already set
            if (!config.deployed_name) {
                config.chaincode.deployed_name = latestDeployed;
            }

            var notDeployedYet = config.chaincode.deployed_name === ('' || null);

            if (notDeployedYet || forceRedeploy){

                logger.info("[SDK] Going to deploy chaincode");

                // Including a unique string as an argument to make sure each new deploy has a unique id
                var deployRequest = {
                    fcn: "init",
                    args: [createHash()],
                    chaincodePath: config.chaincode.projectName // Path to the global directory containing the chaincode project under $GOPATH/src/
                };

                var webAppAdmin = chain.getRegistrar();

                // Deploy the chaincode
                var deployTx = webAppAdmin.deploy(deployRequest);
                deployTx.on('complete', function(results) {
                    logger.info("[SDK] Successfully deployed chaincode");
                    logger.info("[SDK] Deploy result: ",results);

                    afterDeployment(results.chaincodeID, true);

                });
                deployTx.on('error', function(err) {
                    logger.error("[SDK] Failed to deploy chaincode");
                    logger.error("[SDK] Deploy error: ",err)
                });
            } else {
                logger.info("[SDK] Using previously deployed chaincode: " + config.chaincode.deployed_name);

                afterDeployment(config.chaincode.deployed_name);
            }
        });
    }
};

// Save details for deployed code
var afterDeployment = function(newChaincodeID, withTestData) {

    logger.info("[SDK] Executing after deployment");

    // Store the chaincodeId
    chaincodeID = newChaincodeID;

    if (!onBluemix){

        // store deployed_name in a file
        saveLatestDeployed();

        // Start watching the chaincode for changes
        if (config.chaincode.auto_redeploy) watchChaincode();

    }

	// Place test data on blockchain
	if(withTestData) testData.invokeTestData();
};

// Watch filesystem for changes in the local chaincode
var fsTimeout;
var watchChaincode = function() {
    fs.watch(chaincodePath + '/' + chaincodeFilename, function(eventType, filename){
        if (!fsTimeout){
            fsTimeout = setTimeout(function() { fsTimeout=null }, 5000);
            logger.debug("[SDK] Chaincode changed. Redeploying...");
            deployChaincode(true);
        }
    });
    logger.info("[SDK] Watching " + chaincodePath + " for changes...");
};


//=============================================================================================
//      Query and Invoke functions
//=============================================================================================

// Execute a invoke request
exports.invoke = function(fcn, args, userName, cb) {

    getUser(userName, function (err, user) {
        if (err) {
            logger.error("[SDK] Failed to get " + userName + " ---> ", err);
            cb(err)
        } else {

            // Issue an invoke request
            var invokeRequest = {
                chaincodeID: chaincodeID,
                fcn: fcn,
                args: args
            };

            // Invoke the request from the user object.
            var tx = user.invoke(invokeRequest);

            tx.on('submitted', function(results) {
                logger.info("[SDK] submitted invoke:",results);
            });
            tx.on('complete', function(results) {
                logger.info("[SDK] completed invoke:",results);
                cb(null, results)
            });
            tx.on('error', function(err) {
                logger.error("[SDK] error on invoke:",err);
                cb(err)
            });
        }
    })
};

// Execute a query request
exports.query = function(fcn, args, userName, cb) {

    getUser(userName, function (err, user) {
        if (err) {
            logger.error("[SDK] Failed to get " + userName + " ---> ", err);
            cb(err)
        } else {

            // Issue an invoke request
            var queryRequest = {
                chaincodeID: chaincodeID,
                fcn: fcn,
                args: args
            };

            // Trigger the query from the user object.
            var tx = user.query(queryRequest);

            tx.on('submitted', function(results) {
                logger.info("[SDK] submitted query: %j",results);
            });
            tx.on('complete', function(results) {
                logger.info("[SDK] completed query: %j",results.result.toString());
                cb(null, JSON.parse(results.result.toString()))
            });
            tx.on('error', function(err) {
                logger.error("[SDK] error on query: %j",err);
                cb(err)
            });
        }
    })
};
