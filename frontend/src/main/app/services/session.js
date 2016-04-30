(function () {
    'use strict';

    //Defino el módulo para importarlo como dependencia donde se requiera
    var authModule = angular.module('kafhe.services');

    //Defino el servicio concreto de sesiones
    authModule.factory('KSession',
        ['$rootScope', '$cookies', '$location', '$translate', 'CONFIG', 'ROUTES', 'growl',
            function ($rootScope, $cookies, $location, $translate, CONFIG, ROUTES, growl) {
                /**
                 * Genera una cookie de sesión para hacer login
                 * @param token
                 * @param expireTime
                 */
                var login = function (token, expireTime) {
                    var date = new Date();
                    var time = date.getTime() + parseInt(expireTime);
                    date.setTime(time);

                    //Elimino la cookie anterior por si acaso
                    $cookies.remove(CONFIG.sessionCookieName);
                    //Creo la nueva cookie de sesión
                    $cookies.put(CONFIG.sessionCookieName, token, {
                        'expires': date.toGMTString(),
                        'secure': CONFIG.cookieSecure
                    });

                    //Extraigo el nombre de usuario del token
                    var decoded = atob(token);
                    decoded = decoded.split('#');

                    // Actualizo el username en rootScope
                    $rootScope.kUserLogged = decoded[0];
                };

                /**
                 * Función que comprueba si estoy logueado. Mira si existe una cookie realmente.
                 * @param sessionData
                 * @returns {boolean}
                 */
                var refresh = function (sessionData) {
                    //Compruebo que vienen datos
                    if (!sessionData) {
                        return false;
                    }

                    //Cojo la cookie
                    var oldToken = $cookies.get(CONFIG.sessionCookieName),
                        newToken = sessionData.access_token;

                    // si los tokens no coinciden borramos la cookie y la volvemos
                    // a generar con el nuevo token y la nueva fecha de expiración
                    if (oldToken !== newToken) {
                        login(newToken, sessionData.expire);
                    }

                    return true;
                };

                /**
                 * Hace logout, eliminando los datos de la sesión tanto en la cookie como en Mongo en el ws
                 */
                var logout = function (error) {
                    //Elimina la cookie
                    $cookies.remove(CONFIG.sessionCookieName);

                    //Elimino las variables del rootScope
                    $rootScope.kUserLogged = undefined;

                    if (error) {
                        $location.path('/');
                    } else {
                        $location.path('/');
                    }
                    //Mando al usuario a la página de inicio (login)
                    $location.replace();
                };

                /**
                 * Autoriza una sesión, comprobando si está logueado o no el usuario
                 */
                var authorize = function (cameFromLogin) {
                    //Cojo la cookie
                    var cookie = $cookies.get(CONFIG.sessionCookieName);

                    //Compruebo que realmente existe
                    if (cookie === undefined) {
                        //Logout
                        $location.path('/');
                        $location.replace();

                        //Mensaje de error de sesión
                        if (!cameFromLogin) {
                            $translate('errSession').then(function (translation) {
                                growl.error(translation, {});
                            });
                        }
                    } else {
                        //Mantengo la sesión si estoy logueado
                        if ($rootScope.kUserLogged === undefined) {
                            //Decodifico de la cookie el username
                            var decoded = atob(cookie);
                            decoded = decoded.split('#');

                            //Relleno la variable de sesión del usuario
                            $rootScope.kUserLogged = decoded[0];
                        }

                        // Si vengo de la página de login, como estoy logueado mando a home
                        if (cameFromLogin) {
                            $location.path(ROUTES.home);
                        }
                    }
                };


                //Expongo los métodos del servicio
                return {
                    login: login,
                    logout: logout,
                    refresh: refresh,
                    authorize: authorize
                };
            }
        ]);
})();
