(function () {
    'use strict';

    // Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('ExploreController',
            ['$scope', '$translate', 'API', '$mdSidenav', '$log',
                function ($scope, $translate, API, $mdSidenav, $log) {

                    $scope.toggle = fnBuildToggler;
                    $scope.close = fnClose;

                    // Actualizo los datos del juego si hace falta
                    $scope.updateGameData();

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
        .controller('LeftCtrl', ['$scope', '$log', function ($scope, $log) {
        }])
        .controller('RightCtrl', ['$scope', '$log', function ($scope, $log) {
        }]);
})();
