(function () {
    'use strict';

    //Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('ErrorController',
        ['$scope', 'API', '$location',
            function ($scope, API, $location) {
                API.logout().get(function () {
                    $location.redirectTo('/');
                });
            }]);
})();
