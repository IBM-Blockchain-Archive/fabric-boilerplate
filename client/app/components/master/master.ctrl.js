app.controller("MasterController", ["things", "$localStorage", "$location", function (things, $localStorage, $location) {

    var vm = this;

    vm.things = things;
    
    vm.openThing = function(thingId){
        
        $localStorage.selectedThing = thingId;
        $location.path('/detail');
    }
    
}]);
