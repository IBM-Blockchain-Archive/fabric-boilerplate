(function () {
    "use strict";

    app.directive("errorMessage", [function () {
        return {
            restrict: "E",
            scope: {
                error: '='
            },
            templateUrl: "app/shared/errorMessage/errorMessage.html",
            controller: function ($scope) {
                this.error = $scope.error;
            },
            controllerAs: "error"
        };
    }]);

}());