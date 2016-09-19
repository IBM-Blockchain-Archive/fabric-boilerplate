app.service('CaseFileService', ["$q", "$http", "$rootScope", function ($q, $http, $rootScope) {
    return {
        getCaseFiles: function(){
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: ''
            }).then(function success(response) {
                deferred.resolve(response.data);

            }, function error(error) {
                deferred.reject(error);
            });

            return deferred.promise;

            }
        }

}])
