(function () {
    'use strict';

    // Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('ExploreController',
            ['$scope', '$translate', 'API', '$mdSidenav', '$log',
                function ($scope, $translate, API, $mdSidenav, $log) {

                    $scope.toggle = fnBuildToggler;
                    $scope.close = fnClose;


                    /**
                     * Build handler to open/close a SideNav
                     */
                    function fnBuildToggler(navID) {
                        // Component lookup should always be available since we are not using `ng-if`
                        $mdSidenav(navID).toggle();
                    }

                    /**
                     * Cierra el panel
                     */
                    function fnClose(side) {
                        // Component lookup should always be available since we are not using `ng-if`
                        $mdSidenav(side).close();
                    }
                }])
        .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {

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
