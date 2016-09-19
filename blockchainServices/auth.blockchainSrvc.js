const blockchain = require('../blockchain/blockchain');

exports.authenticate = function(args){
    return new Promise(function(resolve, reject){ 
        blockchain.query("authenticate", args[0], args, function(err, result) {
            if(err) {reject(err)} 
            else {resolve(result)}
        });
    });    
};
