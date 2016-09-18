(function () {
    'use strict';

    // Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('ExploreController',
            ['$scope', '$translate', 'API', '$mdSidenav', '$log',
                function ($scope, $translate, API, $mdSidenav, $log) {

                    $scope.toggleLeft = fnBuildToggler('left');
                    $scope.toggleRight = fnBuildToggler('right');

                    /**
                     * Build handler to open/close a SideNav
                     */
                    function fnBuildToggler(navID) {
                        return function () {
                            // Component lookup should always be available since we are not using `ng-if`
                            $mdSidenav(navID)
                                .toggle()
                                .then(function () {
                                    $log.debug("toggle " + navID + " is done");
                                });
                        }
                    }
                }])
        .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
            $scope.close = function () {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav('left').close()
                    .then(function () {
                        $log.debug("close LEFT is done");
                    });

            };
        })
        .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
            $scope.close = function () {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav('right').close()
                    .then(function () {
                        $log.debug("close RIGHT is done");
                    });
            };
        });
})();
