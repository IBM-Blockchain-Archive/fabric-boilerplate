const blockchain = require('../blockchain/blockchain');
const blocks = require('../utils/blocks');

exports.add_user = function(args, enrollmentId){
    console.log(args.length);
    return new Promise(function(resolve, reject){
        blockchain.invoke("add_user", enrollmentId, args, function(err, results){
            if(err) {reject(err)}
            else {
//                blocks.waitForBlockheightIncrease().then(function(){
                    resolve(results)
//                })
            }
        });
    });
};
