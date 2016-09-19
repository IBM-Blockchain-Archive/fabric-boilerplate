'use strict';

const Thing = require('./thing.model');
const ThingsService = require('../../../blockchainServices/things.blockchainSrvc.js');

/*
    Retrieve list of all things

    METHOD: GET
    URL : /api/v1/thing
    Response:
        [{'thing'}, {'thing'}]
*/
exports.list = function(req, res) {
    console.log("-- Query all things --")
    
    const args = [req.body.userId];
    const enrollmentId = enrollID.getID(req);
    
    ThingsService.get_all_things(args,enrollmentId).then(function(things){
        if (!things) {
            res.json([]);
        } else {
            var things = JSON.parse(things)
            console.log("Retrieved things from the blockchain: # " + things.result.length);
            res.json(things.result)
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
    
    const args = [req.params.thingId];
    const enrollmentId = enrollID.getID(req);
    
    ThingsService.get_thing(args,enrollmentId).then(function(thing){
        if (!thing) {
            res.json([]);
        } else {
            var thing = JSON.parse(thing)
            console.log("Retrieved thing from the blockchain");
            res.json(thing.result)
        }
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
}

/*
    Retrieve thing object

    METHOD: POST
    URL: /api/v1/thing/
    Response:
        {  }
*/
exports.add = function(req, res) {
    console.log("-- Adding thing --")
        
    const args = [enrollID.getID(req), req.body.thingId, JSON.stringify(req.body.thing)];
    const enrollmentId = enrollID.getID(req);
    
    ThingsService.add_thing(args,enrollmentId).then(function(thing){
        res.sendStatus(200);
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
}

