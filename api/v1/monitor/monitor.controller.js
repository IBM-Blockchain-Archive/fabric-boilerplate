'use strict';
const MonitorService = require('../../../blockchainServices/monitor.blockchainSrvc.js');
const blocksUtil = require('../../../utils/blocks')

/*
    Retrieve last 20 blocks

    METHOD: GET
    URL: /api/v1/block/:amount
    Response:
        ['block', 'block']

*/
exports.list = function(req, res) {
    // Get the latest chain stats
    MonitorService.chain_stats().then(function(result){
        const blockheight = result.height;
        var amount = req.param.amount || 20;
        var min = 0;
        // if there are more than 20 blocks, let i be height - 20
        if( blockheight > amount ) {
            min = blockheight - amount
        }
        var count = min;
        // get last 20 blocks
        var blocks = [];
        for ( var i = min; i < blockheight; i++ ) {
            (function(){
                MonitorService.block_stats(i).then(function(result){
                    if(result) { blocks.push(result) };
                    count++;
                    if( count == blockheight ) {
                        blocks = sendBlocks(blocks);
                        res.json(blocks);
                    }    
                }).catch(function(err){
                    console.log("Error", err);
                    res.sendStatus(500); 
                }); 
            }(i));
        }
    }).catch(function(err){
        console.log("Error", err);
        res.sendStatus(500);   
    }); 
}

function sendBlocks(blocks) {
    console.log("Sending blocks" + blocks.length);
    blocks.forEach(function(block, idx, blocks){
        console.log(block.uuid);
        blocks[idx].transactions = blocksUtil.decryptTransactionPayload(block.transactions);
    })
    return blocks;
}
