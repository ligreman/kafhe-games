(function () {
    'use strict';

    //Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('HomeController',
            ['$scope', 'API', '$mdDialog', '$translate',
                function ($scope, API, $mdDialog, $translate) {
                    // Variables
                    $scope.itemList = [];
                    $scope.updateGameData(fnAfterUpdate);

                    // Funciones
                    $scope.iconize = fnIconize;
                    $scope.getShopItems = fnGetShopItems;
                    $scope.getNotifications = fnGetNotifications;
                    $scope.confirmBuyItem = fnConfirmBuyItem;
                    $scope.isMine = fnIsMine;

                    // Actualizamos los datos obligatoriamente por las notificaciones
                    $scope.getNotifications();
                    $scope.getShopItems();

                    /**
                     * Una vez he terminado de actualizar los datos
                     */
                    function fnAfterUpdate() {
                    }

                    /**
                     * Genera un nombre de icono para el tipo que se le pase
                     */
                    function fnIconize(tipo) {
                        var icon = '';
                        switch (tipo) {
                            case 'skill':
                                icon = 'flash_on';
                                break;
                            case 'breakfast':
                                icon = 'local_dining';
                                break;
                            case 'forge':
                                icon = 'gavel';
                                break;
                            case 'furnace':
                                icon = 'whatshot';
                                break;
                            case 'fury':
                                icon = 'remove_red_eye';
                                break;
                            case 'equipment':
                                icon = 'security';
                                break;
                            case 'system':
                            default:
                                icon = 'info_outline';
                        }
                        return icon;
                    }

                    /**
                     * Comprueba si la notificación es algo mío para mostrarla a la derecha del timeline
                     * @param notification
                     */
                    function fnIsMine(notification) {
                        var mine = false;

                        switch (notification.type) {
                            case 'equipment':
                            case 'forge':
                            case 'furnace':
                                mine = true;
                                break;
                        }

                        return mine;
                    }

                    /**
                     * Obtiene las notificaciones
                     */
                    function fnGetNotifications() {
                        API.user()
                            .me({}, function (response) {
                                if (response) {
                                    $scope.updateUserObject(response.data.user);
                                }
                            });
                    }

                    /**
                     * Obtiene los objetos comprables
                     */
                    function fnGetShopItems() {
                        API.shop()
                            .list({}, function (response) {
                                if (response) {
                                    $scope.itemList = response.data.items;
                                }
                            });
                    }

                    /**
                     * Confirma la Compra un objeto
                     * @param item
                     */
                    function fnConfirmBuyItem(item) {
                        var name = $translate.instant(item.info.key);
                        var confirm = $mdDialog.confirm()
                            .title($translate.instant('textShopBuyTitle'))
                            .content($translate.instant('textShopBuy', {name: name, points: item.info.price}))
                            .ok($translate.instant('textContinue'))
                            .cancel($translate.instant('textCancel'))
                            .targetEvent(event);

                        $mdDialog.show(confirm).then(function () {
                            // OK, compro
                            buyItem(item);
                        });
                    }

                    function buyItem(item) {
                        // Llamo al API
                        API.shop()
                            .buy({item_id: item.info._id}, function (response) {
                                if (response) {
                                    //Recargo la tienda
                                    fnGetShopItems();

                                    // Recargo el objeto user con el de la respuesta
                                    $scope.updateUserObject(response.data.user);
                                }
                            });
                    }
                }]);
})();
