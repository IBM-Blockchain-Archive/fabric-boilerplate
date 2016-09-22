app.controller("LoginController",["$location", "LoginService", "$localStorage", function ($location, LoginService, $localStorage) {

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
                    $localStorage.user = result.user;

                    // store the token in localStorage
                    $localStorage.token = result.token;
                    
                    delete $localStorage.selectedThing;

                    $location.path("/master");
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
