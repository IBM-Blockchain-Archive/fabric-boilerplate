/*
Run the script with `GOPATH="$(pwd)/../.." node deployAndRegister.js`
For more logs run: `GRPC_TRACE=all DEBUG=hfc  GOPATH="$(pwd)/../.." node deployAndRegister.js`
*/

var hfc = require('hfc');
var fs = require('fs-extra');
var https = require('https');
var logger = require('../../utils/logger');
var credentials = require('./credentials.json').credentials;
var config = require('../chaincodeconfig');
var certFilename = process.env.GOPATH + "/src/" + config.chaincode.projectName + '/' + 'certificate.pem';
var chain = hfc.newChain("deploy-chain-network");
var adminUser = credentials.users.filter(function(u){
    return u.enrollId === "WebAppAdmin";
})[0];

// Download the certificate and move on
var file = fs.createWriteStream(certFilename);
https.get(credentials.cert, function(response) {
    response.pipe(file);
    file.on('finish', function() {
        file.close(initializeBlockchain);  // close() is async, call cb after close completes.
    });
}).on('error', function(err) { // Handle errors
    fs.unlink(certFilename); // Delete the file async. (But we don't check the result)
    initializeBlockchain(err.message);
});

// Set up blockchain and register admin
var initializeBlockchain = function(err){
    if(err) throw err;
    // Creating a local chain object
    chain.setKeyValStore(hfc.newFileKeyValStore('./keyValueStore'));

    chain.setECDSAModeForGRPC(true);
    chain.setDevMode(false);

// Get the tls certificate, needed to connect to the Bluemix Blockchain service
    var cert = fs.readFileSync(certFilename);

// Setting the memberservice and peer urls
    var memberserviceUrl = "grpcs://"+credentials.ca[Object.keys(credentials.ca)[0]].url;
    var peerUrl = "grpcs://"+credentials.peers[0].discovery_host+":"+credentials.peers[0].discovery_port;

// Connect to memberservice and peer
    chain.setMemberServicesUrl(memberserviceUrl,{pem:cert});
    chain.addPeer(peerUrl,{pem:cert});

    logger.info("Connected to memberservice and peer");

    // Enroll the admin user, on succes deploy chaincode and register app users
    chain.enroll(adminUser.enrollId, adminUser.enrollSecret, function(err, webappadmin) {
        if (err){
            logger.error("Error enrolling admin user");
            logger.error(err);
        } else {
            logger.info("Admin user successfully enrolled");
            chain.setRegistrar(webappadmin);

            deployChaincode(webappadmin);

            registerUser();
        }
    });
};


var deployChaincode = function(webappadmin){
    logger.info("Going to deploy chaincode");
    
    var timestamp = Date.now().toString();
    
    // Construct the deploy request
    var deployRequest = {
        chaincodePath: config.chaincode.projectName,
        fcn: "init",
        args: [timestamp],
        certificatePath: "/certs/blockchain-cert.pem"
    };

    // Trigger the deploy transaction
    var deployTx = webappadmin.deploy(deployRequest);

    // Print the deploy results
    deployTx.on('complete', function(results) {
        logger.info("Deploy results: " + JSON.stringify(results));        
        saveChaincodeId(results.chaincodeID);
        
    });
    deployTx.on('error', function(err) {
        logger.error("Failed to deploy chaincode: "+err);
    });

};

var saveChaincodeId = function(chaincodeID){
    logger.info("Saving latest chaincodeID to file"); 
    fs.writeFile('chaincode_id', chaincodeID);
};

var registerUser = function(){
    logger.info("Going to register users");   
    
    var users = config.network.app_users;

    users.forEach(function(user) {
                
        chain.getUser(user.userId, function (err, userObject) {
            if (err) {
                logger.error("Error getting user ",user.userId);
                logger.error(err)
            } else if (userObject.isEnrolled()) {
                logger.info("User "+ user.userId +" is already enrolled")
            } else {
                logger.info("User "+ user.userId +" is not yet enrolled and registered");
                
                // User is not enrolled yet, so perform both registration and enrollment
                var registrationRequest = {
                    enrollmentID: user.userId,
                    affiliation: "institution_a",
                    account: "group1"
                };
                
                chain.registerAndEnroll(registrationRequest, function (err) {
                    if (err) {
                        logger.error("Error registering and enrolling user",user.userId);
                        logger.error(err);
                    } else {
                        logger.info("User "+ user.userId +" successfully registered and enrolled");
                    }
                });
            } 
        });
    });
};