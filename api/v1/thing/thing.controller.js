'use strict';

const Thing = require('./thing.model');
const BlockchainService = require('../../../services/blockchainSrvc.js');

/*
    Retrieve list of all things

    METHOD: GET
    URL : /api/v1/thing
    Response:
        [{'thing'}, {'thing'}]
*/
exports.getAllThings = function(req, res) {
    console.log("-- Query all things --");

    const functionName = "get_all_things";
    const args = [req.userId];

    BlockchainService.query(functionName,args,req.userId).then(function(things){
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
};

/*
    Retrieve thing object

    METHOD: GET
    URL: /api/v1/thing/:thingId
    Response:
        { thing }
*/
exports.getThing = function(req, res) {
    console.log("-- Query thing --")

    const functionName = "get_thing";
    const args = [req.params.thingId];
    
    BlockchainService.query(functionName,args,req.userId).then(function(thing){
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
};

/*
    Add thing object

    METHOD: POST
    URL: /api/v1/thing/
    Response:
        {  }
*/
exports.addThing = function(req, res) {
    console.log("-- Adding thing --")
      
    const functionName = "add_thing";
    const args = [req.body.thingId, JSON.stringify(req.body.thing)];
    
    BlockchainService.invoke(functionName,args,req.userId).then(function(thing){
        res.sendStatus(200);
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
};

