(function () {
    'use strict';

    var app = angular.module('kafhe.directives');

    app.directive('kHeader', [function () {
        return {
            restrict: 'E',
            replace: 'true',
            scope: true,
            templateUrl: 'app/directives/kheader/kheader.html',
            controller: ['$scope', 'API', function ($scope, API) {

                // Funciones publicadas
                // $scope.btnProfileMenu = fnBtnProfileMenu;


                /*********************************************************************/
                /*********************** FUNCIONES ***********************************/


                /**
                 * Botón para mostrar u ocultar el menú profile
                 */
                function fnBtnProfileMenu() {
                    $scope.toggleProfileMenu();
                }

                // Llamo al API para resetear la base de datos
                $scope.resetBBDD = function () {
                    API.dev()
                        .resetmongo({}, function (response) {
                            if (response) {
                                // Mensaje growl de OK
                                $scope.growlNotification('success', 'OK');
                            }
                        });
                };

                // Llamo al API para cambiar el estado de la partida
                $scope.gameStatus = function (estado) {
                    API.dev()
                        .gamestatus({
                            status: estado
                        }, function (response) {
                            if (response) {
                                // Mensaje growl de OK
                                $scope.growlNotification('success', 'OK');
                            }
                        });
                };

            }]
        };
    }]);
})();
