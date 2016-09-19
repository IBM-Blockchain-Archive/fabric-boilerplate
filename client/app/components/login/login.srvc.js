app.service('LoginService', ["$http", "$q", function($http, $q) {
  return {
    authorize: function(credentials){
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/auth/login',
            data: { username: credentials.userId, password: credentials.password }
        }).then(function success(response) {
            deferred.resolve(response.data);

        }, function error(error) {
            deferred.reject(error);
        });

        return deferred.promise;

        }
    }
  }
]);

