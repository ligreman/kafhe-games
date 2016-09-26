(function () {
    'use strict';

    //Controlador principal de todo el sistema.
    angular.module('kafhe.controllers')
        .controller('GlobalController',
            ['$scope', '$rootScope', '$translate', '$location', '$cookies',
                'CONFIG', 'ROUTES', 'growl', 'KGame', '$log', 'API',
                function ($scope, $rootScope, $translate, $location, $cookies,
                          CONFIG, ROUTES, growl, KGame, $log, API) {
                    // Objeto que almacena la información básica. Lo inicializo
                    $scope.global = {};
                    fnClearGlobalVars();

                    // Versión actual
                    $scope.version = null;

                    //Idioma seleccionado por el usuario
                    $scope.lang = $translate.use();

                    // Librería Math de javascript
                    $scope.Math = window.Math;

                    // Página actual
                    $scope.currentPage;
                    // Muestro o no el menú profile
                    $scope.showProfileMenu = false;

                    /************* MÉTODOS PÚBLICOS ******************/
                    $scope.clearGlobalVars = fnClearGlobalVars;
                    $scope.updateGameData = fnUpdateGameData;
                    $scope.updateUserObject = fnUpdateUserObject;
                    $scope.goToPage = fnGoToPage;
                    $scope.isCurrentPage = fnIsCurrentPage;
                    $scope.changeLang = fnChangeLang;
                    $scope.growlNotification = fnGrowlNotification;
                    $scope.toggleProfileMenu = fnToggleProfile;
                    // $scope.pageRoute = fnPageRoute;

                    /************* FUNCIONES *************/
                    /**
                     * Actualiza las variables de información estática de la partida.
                     * Si ya está la variable global cargada, no la recargo de nuevo
                     * @param callback: Función a ejecutar cuando se termine la actualización
                     */
                    function fnUpdateGameData(callback) {
                        $log.debug("Updating game data...");
                        var nextVersion = null;

                        //TODO chekeo de versión de datos del juego
                        API.game().version({}, function (response) {
                            if (response) {
                                nextVersion = response.data.version;

                                if (nextVersion !== $scope.version) {
                                    $log.debug("...new version of data...");
                                    $scope.global.loaded = false;
                                }

                                // Cargo los datos
                                if (!$scope.global.loaded || !$scope.global.user || !$scope.global.gamedata.meals || !$scope.global.gamedata.drinks || !$scope.global.gamedata.skills || !$scope.global.gamedata.talents || !$scope.global.gamedata.objects || !$scope.global.gamedata.places) {
                                    KGame.getGameData(function (user, meals, drinks, skills, talents, places, objects) {
                                        // Actualizo las variables de información general
                                        $scope.global.gamedata.meals = meals;
                                        $scope.global.gamedata.drinks = drinks;
                                        $scope.global.gamedata.skills = skills;
                                        $scope.global.gamedata.talents = talents;
                                        $scope.global.gamedata.places = places;
                                        $scope.global.gamedata.objects = objects;
                                        $scope.global.loaded = true;

                                        // Ahora actualizo y proceso los datos del usuario
                                        fnUpdateUserObject(user);

                                        $log.debug("...updated.");

                                        // Pongo la versión
                                        $scope.version = nextVersion;

                                        if (typeof callback === 'function') {
                                            callback();
                                        }
                                    });
                                } else {
                                    $log.debug("...don't need it.");

                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }
                            }
                        });
                    }

                    /**
                     * Actualiza el objeto usuario (user) dentro de la variable global. Realiza además:
                     * 1. Saca el arma y armadura equipadas
                     * 2. Recoge las habilidades disponibles
                     */
                    function fnUpdateUserObject(user) {
                        //Sacar del objeto user el personaje
                        $scope.global.character = user.game.character;
                        user.game.character = null;

                        /*
                         // Saco el arma equipado
                         var selector = ':has(:root > .id:val("' + user.game.equipment.weapon + '"))';
                         var res = JSONSelect.match(selector, user.game.inventory.weapons);
                         if (res.length === 1) {
                         $scope.global.equipment.weapon = res[0];
                         } else {
                         $scope.global.equipment.weapon = null;
                         }

                         // Saco la armadura equipada
                         selector = ':has(:root > .id:val("' + user.game.equipment.armor + '"))';
                         res = JSONSelect.match(selector, user.game.inventory.armors);
                         if (res.length === 1) {
                         $scope.global.equipment.armor = res[0];
                         } else {
                         $scope.global.equipment.armor = null;
                         }

                         // Limpio las skills para generar el array de nuevo
                         $scope.global.skills = [];
                         // Ahora saco las habilidades de arma equipada
                         if ($scope.global.equipment.weapon && $scope.global.equipment.weapon !== '') {
                         $scope.global.equipment.weapon.skills.forEach(function (skill) {
                         $scope.global.skills.push(skill);
                         });
                         }

                         // Ahora saco las habilidades de armadura equipada
                         if ($scope.global.equipment.armor && $scope.global.equipment.armor !== '') {
                         $scope.global.equipment.armor.skills.forEach(function (skill) {
                         $scope.global.skills.push(skill);
                         });
                         }

                         // El inventario del jugador
                         $scope.global.inventory = user.game.inventory;*/

                        // Variables para pintar en el front
                        // Reputación
                        //$scope.global.print.toastPoints = $scope.Math.floor(user.game.stats.reputation / CONFIG.constReputationToToastProportion);
                        $scope.global.print.tostolares = user.game.tostolares;
                        $scope.global.print.fame = user.game.fame;
                        $scope.global.print.rank = user.game.rank;

                        $scope.global.user = user;
                        $scope.global.leader = user.leader;

                        /*var cantidad = user.game.stats.reputation % CONFIG.constReputationToToastProportion;
                         // Lo paso de (0 a config) a un valor 0-100%
                         var proporcion = cantidad * 100 / CONFIG.constReputationToToastProportion;
                         // Ahora, como mis grados van de 0 a 90, hago la regla de tres
                         proporcion = proporcion * 90 / 100;
                         // Para mí 90º es lo más bajo, por lo que tengo que invertirlo
                         var degrees = $scope.Math.round(90 - proporcion);
                         $scope.global.print.reputationDegreeStyle = {"transform": "rotate(" + degrees + "deg)"};*/

                        // Las notificaciones, tanto de la partida como del jugador
                        var notifications = user.game.notifications;
                        // notifications = notifications.concat(user.game.gamedata.notifications);
                        // Ahora tengo que ordenar las notificaciones por fecha
                        notifications.sort(function (a, b) {
                            if (a.timestamp > b.timestamp) {
                                return -1;
                            } else if (a.timestamp < b.timestamp) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });

                        // Creo de nuevo el array de notificaciones globales
                        $scope.global.notifications = [];
                        notifications.forEach(function (notif) {
                            var data = notif.message.split('#');

                            $scope.global.notifications.push({
                                type: notif.type,
                                timestamp: notif.timestamp,
                                key: data[0],
                                params: data[1]
                            });
                        });
                    }

                    /**
                     * Función para cambiar de página
                     * @param page Ruta destino
                     */
                    function fnGoToPage(page) {
                        $scope.currentPage = page;
                        // $location.path($scope.pageRoute(page));
                        $location.path(ROUTES[page]);
                    }

                    /**
                     * Comprueba si estoy en la pagina esta
                     */
                    function fnIsCurrentPage(page) {
                        // var donde = $scope.pageRoute(page);
                        var donde = ROUTES[page];
                        return ($location.path() === null || $location.path() === donde);
                    }

                    /**
                     * Devuelve la ruta de una página
                     */
                    /*function fnPageRoute(page) {
                     var route;
                     switch (page) {
                     case 'home':
                     route = ROUTES.home;
                     break;
                     case 'breakfast':
                     route = ROUTES.breakfast;
                     break;
                     case 'team':
                     route = ROUTES.team;
                     break;
                     case 'explore':
                     route = ROUTES.explore;
                     break;
                     case 'login':
                     route = ROUTES.login;
                     break;
                     case 'profile':
                     route = ROUTES.profile;
                     break;
                     }
                     return route;
                     }*/

                    /**
                     * Función de cambio de idioma
                     * @param lang Idioma destino. Si no es uno de los aceptados no se cambia el idioma
                     */
                    function fnChangeLang(lang) {
                        if (lang === CONFIG.languages.english || lang === CONFIG.languages.spanish) {
                            $translate.use(lang);
                            $scope.lang = lang;
                        }
                    }

                    /**
                     * Muestra un growl con el mensaje que se quiera
                     * @param type Tipo de mensaje: warn, info, success, danger
                     * @param msg Mensaje.
                     * @param title
                     */
                    function fnGrowlNotification(type, msg, title) {
                        //Traduzco el mensaje del toast de forma asíncrona
                        var translation = $translate.instant(msg),
                            transTitle = '';

                        if (title) {
                            transTitle = $translate.instant(title);
                        }

                        switch (type) {
                            case 'warning':
                                growl.warning(translation, {title: transTitle});
                                break;
                            case 'error':
                                growl.error(translation, {title: transTitle});
                                break;
                            case 'success':
                                growl.success(translation, {title: transTitle});
                                break;
                            case 'info':
                            default:
                                growl.info(translation, {title: transTitle});
                        }
                    }

                    /**
                     * Limpia las variables globales
                     */
                    function fnClearGlobalVars() {
                        $scope.global = {
                            user: {},
                            character: {},
                            leader: false,
                            gamedata: {
                                meals: [],
                                drinks: [],
                                skills: [],
                                talents: [],
                                places: [],
                                objects: []
                            },
                            print: {},
                            skills: [],
                            equipment: {},
                            inventory: {},
                            notifications: [],
                            navigation: {},
                            loaded: false
                        };
                    }

                    /**
                     * Abre o cierra el menú lateral
                     */
                    function fnToggleProfile() {
                        $scope.showProfileMenu = !$scope.showProfileMenu;
                    }

                }]);
})();
