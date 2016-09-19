const blockchain = require('../blockchain/blockchain');
const blocks = require('../utils/blocks');

exports.get_all_things = function(arguments, enrollmentId){
    return new Promise(function(resolve, reject){
        blockchain.query("get_all_things", enrollmentId, function(err, results){
            if(err) {reject(err)} 
            else {resolve(results)}
        });
    });    
};

exports.get_thing = function(arguments, enrollmentId){ 
    return new Promise(function(resolve, reject){
        blockchain.query("get_thing", enrollmentId, function(err, results){
            if(err) {reject(err)} 
            else {resolve(results)}
        }); 
    });    
};

exports.add_thing = function(arguments, enrollmentId){ 
    return new Promise(function(resolve, reject){
        blockchain.invoke("add_thing", enrollmentId, function(err, results){
            if(err) {reject(err)} 
            else {
//                blocks.waitForBlockheightIncrease().then(function(){
                    resolve(results)
//                })
            }
        }); 
    });    
};


