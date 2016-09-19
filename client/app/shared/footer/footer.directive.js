(function () {
    "use strict";
    
    app.directive("footerBar", [function () {
        return {
            restrict: "E",
            templateUrl: "app/shared/footer/footer.html",
            controller: function () {},
            controllerAs: "footerbar"
        };
    }]);

}());
