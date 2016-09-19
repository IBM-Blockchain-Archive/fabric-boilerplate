(function () {
    "use strict";

    app.directive("spinner", [function () {
        return {
            restrict: "E",
            template: "<div class='loading-spinner'><img src='assets/images/spinner.gif'/></div>",
            controller: function () {},
            controllerAs: "spinner"
        };
    }]);

}());
