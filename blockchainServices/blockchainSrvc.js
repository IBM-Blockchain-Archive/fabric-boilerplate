const blockchain = require('../blockchain/blockchain');

exports.query = function(functionName, args, enrollmentId){
    return new Promise(function(resolve, reject){
        blockchain.query(functionName, args, enrollmentId, function(err, results){
            if(err) {reject(err)} 
            else {resolve(results)}
        });
    });    
};

exports.invoke = function(functionName, args, enrollmentId){ 
    return new Promise(function(resolve, reject){
        blockchain.invoke(functionName, args, enrollmentId, function(err, results){
            if(err) {reject(err)} 
            else {resolve(results)}
        }); 
    });    
};