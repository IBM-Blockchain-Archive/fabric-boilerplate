'use strict';

const testData = require('./testData.json');
const logger = require('../utils/logger');
const BlockchainService = require('../blockchainServices/blockchainSrvc');

const User = require('../api/v1/user/user.model')
const blockchain = require('../blockchain/blockchain');

exports.invokeTestData = function(){

    logger.info("[TestData] Deploying Test Data")

    resetIndexes(function() {
        writeUsersToLedger(testData.users);
        writeThingsToLedger(testData.things);
    })

}

function resetIndexes(cb){
    logger.info("[TestData] Resetting indexes:");

    const functionName = "reset_indexes"
    const args = [];
    const enrollmentId = "WebAppAdmin";

    BlockchainService.invoke(functionName,args,enrollmentId).then(function(result){
        logger.info("[TestData] Index reset");
        cb()
    }).catch(function(err){
        logger.error(err);
    });

}

function writeUsersToLedger(users){
    logger.info("[TestData] Number of users:", testData.users.length);

    users.forEach( function(user, idx) {
        user = new User(user.userId, user.password, user.firstName, user.lastName, user.things, user.address, user.phoneNumber, user.emailAddress );

        let userAsJson = JSON.stringify(user);

        logger.info("[TestData] Will add new user:");
        logger.info(userAsJson);

        const functionName = "add_user"
        const args = [user.userId, userAsJson];
        const enrollmentId = "WebAppAdmin";

        BlockchainService.invoke(functionName,args,enrollmentId).then(function(result){
            logger.info("[TestData] Added user: ", user.userId);
        }).catch(function(err){
            logger.error(err);
        });
    })
}

function writeThingsToLedger(things){
    logger.info("[TestData] Number of things:", testData.things.length);
    
    things.forEach(function(thing, idx) {
        let thingAsJson = JSON.stringify(thing);
        
        logger.info("[TestData] Will add new Thing:");
        logger.info(thingAsJson);
        
        const functionName = "add_thing"
        const args = [thing.id, thingAsJson];
        const enrollmentId = "WebAppAdmin";

        BlockchainService.invoke(functionName,args,enrollmentId).then(function(result){
            logger.info("[TestData] Added thing: ", thing.id);
        }).catch(function(err){
            logger.error(err);
        });
    })
}
