app.config(function ($routeProvider, $httpProvider) {

    $routeProvider

    .when('/', {
        templateUrl: 'app/components/login/login.html',
        controller: 'LoginController as login'
    })

    .when('/master', {
        templateUrl: 'app/components/master/master.html',
        controller: 'MasterController as master',
        resolve: {
            things: function (ThingsService) {
                return ThingsService.getAllThings();
            }
        }
    })

    .when('/detail', {
        templateUrl: 'app/components/detail/detail.html',
        controller: 'DetailController as detail',
        resolve: {
            thing: function (ThingsService) {
                return ThingsService.getThing();
            }
        }
    })

    .otherwise({
        redirectTo: '/'
    });

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};

                if ($localStorage.token) {
                    config.headers['x-access-token'] = $localStorage.token;
                }
                return config;
            },
            'responseError': function (response) {
                if (response.status === 401 || response.status === 403) {
                    $location.path('/');
                }
                return $q.reject(response);
            }
        };
    }]);
});