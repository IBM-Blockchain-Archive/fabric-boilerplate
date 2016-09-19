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
            loginCheck: function (CommonService) {
                return CommonService.isLoggedIn();
            },
            caseFiles: function (CaseFilesService) {
                return CaseFilesService.getCaseFiles();
            }
        }
    })

    .when('/detail', {
        templateUrl: 'app/components/detail/detail.html',
        controller: 'DetailController as detail',
        resolve: {
            loginCheck: function (CommonService) {
                return CommonService.isLoggedIn();
            },
            clientInfo: function (CaseFileService) {
                return CaseFileService.getClientInfo();
            }
        }
    })

    .when('/monitor', {
        templateUrl: 'app/components/monitor/monitor.html',
        controller: 'MonitorController as monitor',
        resolve: {
            loginCheck: function (CommonService) {
                return CommonService.isLoggedIn();
            },
            blocks: function (MonitorService) {
                return MonitorService.getBlocks();
            }
        }
    })

    .otherwise({
        redirectTo: '/404'
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