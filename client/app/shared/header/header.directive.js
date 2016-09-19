(function () {
    "use strict";

    app.directive("headerBar", [function () {
        return {
            restrict: "E",
            templateUrl: "app/shared/header/header.html",
            controller: function ($rootScope, $scope, $location, $localStorage, CommonService) {

                $scope.username = $rootScope.user.username;
                
                $scope.role = CommonService.getRole();
                
                $scope.logout = function(){
                    $rootScope.user.userId = undefined;
                    $rootScope.user.certRole = undefined;
                    $rootScope.user.username = undefined;
                    $rootScope.currentKvkNumber = undefined;
                    delete $localStorage.token;
                    $location.path("/") 
                }
                $scope.currentPath = $location.path()

                $scope.openPage = function(page){
                    $location.path("/"+page)
                }
            },
            controllerAs: "headerbar"
        };
    }]);

}());
