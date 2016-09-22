app.controller("DetailController", ["thing", "$localStorage", "$location",function (thing, $localStorage, $location) {
    var vm = this;

    vm.thing = thing;
    
    vm.goBack = function(){
        delete $localStorage.selectedThing;
        $location.path("/master")   
    }

}]);
