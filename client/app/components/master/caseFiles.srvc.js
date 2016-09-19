app.service('CaseFilesService', ["$q", "$http", "$rootScope", function ($q, $http, $rootScope) {
    
    return {
        getCaseFiles: function () {
            var deferred = $q.defer();
            
            console.log("CasefileService -- Get assigned casefiles based on userId: ", $rootScope.user.userId);
            
            $http({
                method: 'GET',
                url: '/api/v1/client/' + $rootScope.user.userId
            }).then(function success(response) {
                deferred.resolve(response.data);
            }, function error(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

    }

}])