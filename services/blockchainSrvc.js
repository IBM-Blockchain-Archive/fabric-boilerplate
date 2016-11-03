const blockchain = require('../blockchain/blockchain');
const logger = require('../utils/logger');

exports.query = function(functionName, args, enrollmentId){
    return new Promise(function(resolve, reject){
        args.forEach(function(arg, i) {
            if (arg == null) {
                var err = new Error('Sent undefined argument (position ' + i +') to ' + functionName);
                logger.error(err.message, args);
                return reject(err);
            }
        });

        blockchain.query(functionName, args, enrollmentId, function(err, results){
            if(err) {return reject(err.msg)}
            if(typeof results === 'string') {
                return resolve(JSON.parse(results));
            }
            resolve(results);
        });
    });
};

exports.invoke = function(functionName, args, enrollmentId){
    return new Promise(function(resolve, reject){
        args.filter(function(arg, i) {
            if (arg == null) {
                var err = new Error('Sent undefined argument (position ' + i +') to ' + functionName);
                logger.error(err.message, args);
                return reject(err);
            }
        });

        blockchain.invoke(functionName, args, enrollmentId, function(err, results){
            if(err) {reject(err)}
            else {resolve(results)}
        });
    });
};
