app.service('MonitorService', ["$q", "$http", "$rootScope", function ($q, $http, $rootScope) {

    return {
        getBlocks: function () {
            var deferred = $q.defer();

            console.log("Monitor Service -- Getting the last 20 blocks ");

            $http({
                method: 'GET',
                url: '/api/v1/monitor/blocks',
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

    }

}])