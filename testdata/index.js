'use strict';

const testData = require('./testData.json');
const logger = require('../utils/logger');
const User = require('../api/v1/user/user.model')
const blockchain = require('../blockchain/blockchain');
var chaincodeConfig = require('../blockchain/chaincodeconfig.js');
const blockchainService = require('../services/blockchainSrvc');
var admin = chaincodeConfig.chaincode.webAppAdmin.enrollId;

exports.invokeTestData = function(){
    logger.info("-- Deploying Test Data as ", admin, "--");

    var users = testData.users.map(function(user){
        return new User(
            user.id,
            user.password,
            user.firstName,
            user.lastName,
            user.things,
            user.address,
            user.phoneNumber,
            user.emailAddress,
            user.role
        );
    });

    //
    var args = [JSON.stringify(users),
                JSON.stringify(testData.things)
               ];

    // if you do not care about the order
//    var args = Object.keys(testData).map(function(key) { return JSON.stringify(testData[key]) });
    blockchainService.invoke("add_test_data", args, admin).then(function (result) {
            logger.debug("-- Added testData");
        }, function(err){logger.error(err)});
}
