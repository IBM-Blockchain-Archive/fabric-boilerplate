app.service('CommonService', ["$q", function ($q) {

    return {
        // Check if the user is logged in
        isLoggedIn: function () {
            var deferred = $q.defer();

            deferred.resolve();

            return deferred.promise;
        },

        // Return the current role in a more user friendly way
        getRole: function () {
            return 'employee';
        }

    }

}])
