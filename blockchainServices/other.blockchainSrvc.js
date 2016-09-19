const blockchain = require('../blockchain/blockchain');
const blocks = require('../utils/blocks');

exports.reset_indexes = function(args, enrollmentId){
    return new Promise(function(resolve, reject){
        blockchain.invoke("reset_indexes", enrollmentId, args, function(err, results){
            if(err) {reject(err)}
            else {
//                blocks.waitForBlockheightIncrease().then(function(){
                    resolve(results)
//                })
            }
        });
    });
};
