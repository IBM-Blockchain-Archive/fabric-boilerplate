app.controller("MonitorController", ["$scope", "$location", "MonitorService", "blocks", function ($scope, $location, MonitorService, blocks) {

    var vm = this;

    //  may vary per style guide
    var history = "glyphicon-calendar";
    var transfer = "ocf-icon-ideal";
    var completed = "glyphicon-ok-circle";
    var warning = "glyphicon-warning-sign";
    //

    vm.filtered;
    vm.transactions = [];

    // Add timestamps, sort blocks and store array in vm.blocks
    var tmpBlocks = blocks.data.slice(0);
    var d = new Date();
    for (var i = 0; i < tmpBlocks.length; i++) {
        tmpBlocks[i].timeStamp = d.setTime(parseInt(tmpBlocks[i].nonHashData.localLedgerCommitTimestamp.seconds) * 1000);
    }
    tmpBlocks.sort(function (a, b) { return a.timeStamp - b.timeStamp })
    vm.blocks = tmpBlocks.slice(0);;

    // Navigate back to casefile
    vm.back = function () {
        $location.path("/detail")
    }
    
    // Create new websocket
    ws = new WebSocket("ws://"+window.location.host);
   
    ws.onmessage = function(evt) { 

        // Parse the block
        var block = JSON.parse(evt.data);
        
        // Check if the block is not the same as the previous block (i've seen this happen right after you started the server)
        if (block.stateHash != vm.blocks[vm.blocks.length - 1].stateHash){
            
            // Add timestamp
            block.timeStamp = d.setTime(parseInt(block.nonHashData.localLedgerCommitTimestamp.seconds) * 1000);
            
            // Add block to blocks array
            vm.blocks.push(block)
            
            // Trigger digest cycle to display block on the screen
            $scope.$apply();  
        }; 
    };
    
    ws.onerror = function(evt) { 
        console.log("error", evt)
    };

}]);
