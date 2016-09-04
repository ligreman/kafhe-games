(function () {
    'use strict';

    // Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('BreakfastController',
            ['$scope', '$mdDialog', '$translate', 'API',
                function ($scope, $mdDialog, $translate, API) {
                    $scope.selection = {
                        meal: '',
                        drink: '',
                        ito: false
                    };

                    // Actualizamos mis datos de partida en caso de que haga falta
                    $scope.updateGameData(function () {
                        if ($scope.global.user.game.order && $scope.global.user.game.order.meal && $scope.global.user.game.order.drink) {
                            $scope.selection.meal = $scope.global.user.game.order.meal._id;
                            $scope.selection.drink = $scope.global.user.game.order.drink._id;
                            $scope.selection.ito = $scope.global.user.game.order.ito;
                        }
                    });

                    // Cambio de pedido
                    $scope.btnMakeOrder = function (event) {
                        if ($scope.selection.ito === false) {
                            // Si no es ITO pediré confirmación
                            var confirm = $mdDialog.confirm()
                                .title($translate.instant('textOrderNoItoTitle'))
                                .content($translate.instant('textOrderNoItoContent'))
                                .ok($translate.instant('textContinue'))
                                .cancel($translate.instant('textCancel'))
                                .targetEvent(event);

                            $mdDialog.show(confirm).then(function () {
                                // OK, envío el pedido
                                sendOrder();
                            }, function () {
                                $scope.growlNotification('info', 'textYaMeParecia');
                            });
                        } else {
                            sendOrder();
                        }

                    };

                    // Envía un pedido al API
                    function sendOrder() {
                        // He seleccionado cambiar el pedido
                        API.order()
                            .create({
                                meal: $scope.selection.meal,
                                drink: $scope.selection.drink,
                                ito: $scope.selection.ito
                            }, function (response) {
                                if (response) {
                                    // Me devuelve el objeto usuario actualizado
                                    $scope.updateUserObject(response.data.user);

                                    // Mensaje growl de OK
                                    $scope.growlNotification('success', 'textOrderChanged');
                                }
                            });
                    }

                    // Envío la petición de eliminar el pedido
                    $scope.btnRemoveOrder = function () {
                    };

                    // Lo del otro día
                    $scope.btnLastDayOrder = function () {
                        if ($scope.global.user.game.last_order && $scope.global.user.game.last_order.meal) {
                            $scope.selection.meal = $scope.global.user.game.last_order.meal._id;
                            $scope.selection.drink = $scope.global.user.game.last_order.drink._id;
                            $scope.selection.ito = $scope.global.user.game.last_order.ito;
                        } else {
                            $scope.growlNotification('warning', 'textNoLastOrder');
                        }
                    };

                    // Filtro ITO
                    $scope.itoSelected = function (element) {
                        return !($scope.selection.ito && !element.ito);
                    };

                }]);
})();
