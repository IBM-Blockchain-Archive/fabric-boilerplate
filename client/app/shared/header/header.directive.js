(function () {
    "use strict";

    app.directive("headerBar", [function () {
        return {
            restrict: "E",
            templateUrl: "app/shared/header/header.html",
            controller: function ($location, $localStorage) {
                var vm = this;
                
                vm.user = $localStorage.user;
                                
                vm.logout = function(){
                    delete $localStorage.user;
                    delete $localStorage.selectedThing;
                    delete $localStorage.token;
                    $location.path("/") 
                }
            },
            controllerAs: "header"
        };
    }]);

}());
