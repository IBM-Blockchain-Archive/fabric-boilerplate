'use strict';
const blockchain = require('../blockchain/blockchain');
var Promise = require('bluebird');

// Get current blockchain height
exports.getBlockHeight = function(){
    return new Promise(function(resolve){
        blockchain.ibc.chain_stats(function (e, stats) {
            resolve(stats.height)    
        });
    });
};

// Wait for the blockchain height to increse before resolving a promise
exports.waitForBlockheightIncrease = function(){
    return new Promise(function(resolve){
        var previousBlockheight;
        function getAndCompareHeights(previousBlockheight){
            blockchain.ibc.chain_stats(function (e, stats) {
                if (previousBlockheight == undefined){
                    previousBlockheight = stats.height; 
                }
                
                if (stats.height > previousBlockheight) {
                    resolve()
                } else {
                    setTimeout(function () {
                        getAndCompareHeights(stats.height)
                    }, 300);
                }
            });   
        }
        getAndCompareHeights(previousBlockheight)   
    })
}


// Utility function to decrypt transaction payload
exports.decryptTransactionPayload = function(transactions) {
    if(transactions){
        transactions.forEach(function(transaction, idx, transactions){
            var g = new Buffer(transaction.payload, 'base64').toString();
            var r = /[^\x00-\x7F]/g;
            g = g.replace(r, "" );
            g = unescape(g);
            // Trim 152 characters of chaincodeId and unicode
            g = g.substring(131);
            // TODO remove chaincodeId

            transaction.event = eventDecode(transaction.type, g);
            transaction.payload = g;
            transactions[idx] = transaction;
        })
    }
    return transactions;
}

// Utility function to decode transaction event
function eventDecode(trxType, payload){
    if (trxType == 1) {
        return "New chaincode activated";
    };
        
    var go_functions = blockchain.chaincode.details.func;
            
    for (var i = 0; i < go_functions.length; i++){
        if (payload.indexOf(go_functions[i]) > 0) {
            var action = go_functions[i];
            action = action.replace("_", " ");
            action = action.charAt(0).toUpperCase() + action.slice(1);
            var st1 = '{ \"action\" : \"'+ action +'\", \"function\" : \"'+ go_functions[i] +'\"}';
            var evt2 = JSON.parse(st1);
            return evt2
        };
    }
    return  "Unidentified action: " + payload;
}
