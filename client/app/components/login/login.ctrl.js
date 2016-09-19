app.controller("LoginController", ["$location", "$rootScope", "CaseFileService", "LoginService", "$scope", "$localStorage", function ($location, $rootScope, CaseFileService, LoginService, $scope, $localStorage) {

    var vm = this;

    vm.showAuthenticatingSpinner = false;
    vm.invalidCredentials = false;

    vm.login = function (credentials) {

        vm.showAuthenticatingSpinner = true;
        vm.invalidCredentials = false;

        LoginService.authorize(credentials)
            .then(function (result) {
                console.log("Returning login result: ")
                console.log(result);
                if (!result) {
                    vm.showAuthenticatingSpinner = false;
                    vm.invalidCredentials = true;
                } else if (result.authenticated) {
                    vm.showAuthenticatingSpinner = false;

                    // set user and navigation information on rootscope
                    $rootScope.user.userId = result.user.userId;
                    $rootScope.user.certRole = result.certRole;
                    $rootScope.user.username = result.user.firstName + " " + result.user.lastName;

                    // store the token in localStorage
                    $localStorage.token = result.token;

                    // route based on role
                    if ($rootScope.user.certRole == 1) {
                        $location.path("/master");
                    } else if ($rootScope.user.certRole == 2) {
                        $rootScope.currentKvkNumber = result.user.clients[0];
                        $location.path("/client");
                    }
                } else {
                    vm.showAuthenticatingSpinner = false;
                    vm.invalidCredentials = true;
                }

            }, function (error) {

                console.log("Failed to authorize");
                console.log(error);
                vm.showAuthenticatingSpinner = false;
                vm.invalidCredentials = true;

            });
    }

}]);
