'use strict';

const Thing = require('./thing.model');
const BlockchainService = require('../../../blockchainServices/blockchainSrvc.js');
const enrollID = require('../../../utils/enrollID')

/*
    Retrieve list of all things

    METHOD: GET
    URL : /api/v1/thing
    Response:
        [{'thing'}, {'thing'}]
*/
exports.list = function(req, res) {
    console.log("-- Query all things --")
    
    var userID = enrollID.getID(req);
    
    const functionName = "get_all_things"
    const args = [userID];
    const enrollmentId = userID;
    
    BlockchainService.query(functionName,args,enrollmentId).then(function(things){
        if (!things) {
            res.json([]);
        } else {
            console.log("Retrieved things from the blockchain: # " + things.length);
            res.json(things)
        }
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
}

/*
    Retrieve thing object

    METHOD: GET
    URL: /api/v1/thing/:thingId
    Response:
        { thing }
*/
exports.detail = function(req, res) {
    console.log("-- Query thing --")
    
    const functionName = "get_thing"
    const args = [req.params.thingId];
    const enrollmentId = enrollID.getID(req);
    
    BlockchainService.query(functionName,args,enrollmentId).then(function(thing){
        if (!thing) {
            res.json([]);
        } else {
            console.log("Retrieved thing from the blockchain");
            res.json(thing)
        }
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
}

/*
    Add thing object

    METHOD: POST
    URL: /api/v1/thing/
    Response:
        {  }
*/
exports.add = function(req, res) {
    console.log("-- Adding thing --")
      
    const functionName = "add_thing"
    const args = [req.body.thingId, JSON.stringify(req.body.thing)];
    const enrollmentId = enrollID.getID(req);
    
    BlockchainService.invoke(functionName,args,enrollmentId).then(function(thing){
        res.sendStatus(200);
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
}

