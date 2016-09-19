const blockchain = require('../blockchain/blockchain');
const blocks = require('./blocks')
const WebSocket = require('ws');
const watch = require("watchjs").watch;

// Variable to store the newest block in
var block = {
    newestBlock: ""
};

exports.startWebSocket = function(server){
    var wss = {};
    wss = new WebSocket.Server({server: server});	

    wss.on('connection', function connection(wss) {

        // Watch the block variable and send the newest block if there is a change deteced
        watch(block, function(){
            wss.send(block.newestBlock);
        });
        
        watchForNewBlock(wss);    
    });
}

// Watch for new blocks
function watchForNewBlock(wss){
    
    // Call callback function every time the blockheight increases
    blockchain.ibc.monitor_blockheight(function(result, error){
        if (error){
            console.log(error)
        }
        
        // Get the details of the new block
        blockchain.ibc.block_stats(result.height -1, function(e, newBlock){
            if (e){
                console.log(e)
            }
            
            // Decrypt the transactions
            newBlock.transactions = blocks.decryptTransactionPayload(newBlock.transactions)
            
            // Store the new block in the block variable
            block.newestBlock = JSON.stringify(newBlock);
        });
    });
}