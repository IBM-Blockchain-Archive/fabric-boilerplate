const testData = require('./testData.json');
const logger = require('../utils/logger');
const UserService = require('../blockchainServices/user.blockchainSrvc');
const ThingService = require('../blockchainServices/things.blockchainSrvc');
const OtherService = require('../blockchainServices/other.blockchainSrvc');

const User = require('../api/v1/user/user.model')
const blockchain = require('../blockchain/blockchain');

exports.invokeTestData = function(){

    logger.debug("[TestData] Deploying Test Data")

    resetIndexes()

    // Waiting 5 seconds so the index reset is done, need to do this in a better way later
    setTimeout(function () {

        writeUsersToLedger(testData.users);
        writeClientsToLedger(testData.things);
    }, 5000)

}

function resetIndexes(){
    logger.debug("[TestData] Resetting indexes:");

    const args = [];
    const enrollmentId = "WebAppAdmin";

    OtherService.reset_indexes(args,enrollmentId).then(function(result){
        logger.debug("[TestData] Index reset");
    }).catch(function(err){
        logger.debug(err);
    });

}

function writeUsersToLedger(users){
    logger.debug("[TestData] Number of users:", testData.users.length);

    users.forEach( function(user, idx) {
        user = new User(user.userId, user.password, user.firstName, user.lastName, user.things, user.address, user.phoneNumber, user.emailAddress );

        let userAsJson = JSON.stringify(user);

        logger.debug("[TestData] Will add new user:");
        logger.debug(userAsJson);

        const args = [user.userId, userAsJson];
        const enrollmentId = "WebAppAdmin";

        UserService.add_user(args,enrollmentId).then(function(result){
            logger.debug("[TestData] Added user: ", user.userId);
        }).catch(function(err){
            logger.debug(err);
        });
    })
}

function writeClientsToLedger(things){
    logger.debug("[TestData] Number of things:", testData.things.length);
    things.forEach(function(thing, idx) {
        let thingAsJson = JSON.stringify(thing);
        logger.debug("[TestData] Will add new Thing:");
        logger.debug(thingAsJson);

        ThingService.add_thing([thing.id, thingAsJson], function(err, result){
            if(err) {
                logger.debug(err);
                next(err);
            }
            else {
                logger.debug("-- Added thing: ", thing.id)
            }
        })
    })
}
