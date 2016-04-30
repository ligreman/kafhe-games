(function () {
    'use strict';

    var interceptorModule = angular.module('kafhe.services');

    interceptorModule.factory('KInterceptor',
        ['$rootScope', '$q', '$translate', '$location', 'CONFIG', 'ROUTES', '$cookies', 'KSession', 'growl',
            function ($rootScope, $q, $translate, $location, CONFIG, ROUTES, $cookies, KSession, growl) {
                return {
                    /**
                     * Peticiones
                     * Se comprobará que está iniciada la sesión (que existe la cookie)
                     * @param config
                     * @returns {*}
                     */
                    'request': function (config) {
                        var galleta = $cookies.get(CONFIG.sessionCookieName);

                        //Si es una petición de webservice, pero no de login te saco fuera
                        if (galleta === undefined &&
                            config.url.indexOf(CONFIG.webServiceUrl) !== -1 &&
                            config.url.indexOf(ROUTES.loginValidation) === -1) {

                            //Muestro el growl con el error
                            var transTitle = $translate.instant('textError'),
                                translation = $translate.instant('errSession');

                            growl.error(translation, {title: transTitle});

                            KSession.logout(true);
                        }

                        return config;
                    },

                    /**
                     * Aquí llegarán sólo las respuestas con código 200
                     * Actualizo la cookie con el token
                     * si es que viene informado el campo session en response
                     * @param response
                     * @returns {*}
                     */
                    'response': function (response) {
                        if (response.config.url.indexOf(CONFIG.webServiceUrl) !== -1) {
                            var isError = false, code;

                            //Compruebo que me viene el campo session en la respuesta
                            if (response.data.session) {
                                isError = (response.data.error !== '');
                                code = response.data.code;
                            } else {
                                isError = true;
                                code = 'errNoSession';
                            }

                            //Si isError es true es que ha pasado algo raro
                            if (isError) {
                                //Muestro el growl con el error
                                var transTitle = $translate.instant('textError'),
                                    translation = $translate.instant(code);

                                growl.error(translation, {title: transTitle});

                                //Le saco
                                KSession.logout(true);

                                //Rechazo la promise para que corte la ejecución
                                return $q.reject(response);
                            } else {
                                //Renuevo la sesión
                                KSession.refresh(response.data.session);
                            }
                        }
                        return response;
                    },


                    /**
                     * Aquí llegarán sólo las respuestas con código distinto de 200
                     * Actualizo la cookie con el token
                     * si es que viene informado el campo session en response
                     * @param rejection
                     * @returns {*}
                     */
                    'responseError': function (rejection) {
                        //Si es una respuesta de una llamada al API
                        if (rejection.config.url.indexOf(CONFIG.webServiceUrl) !== -1) {
                            //Recupero el código de error
                            var errorCode;
                            if (rejection.data) {
                                errorCode = rejection.data.error;
                            } else {
                                errorCode = 'errServerException';
                            }

                            // Miro si es una respuesta de error de sesión 401 Unauthorized
                            if (!errorCode && rejection.status === 401 && rejection.data === 'Unauthorized') {
                                errorCode = 'errSession';
                            }

                            //Muestro el growl con el error
                            var transTitle = $translate.instant('textError'),
                                translation = $translate.instant(errorCode);

                            growl.error(translation, {title: transTitle});

                            //Si es un error de algo de sesiones le saco
                            if (CONFIG.errorCodesSession.indexOf(errorCode) !== -1) {
                                KSession.logout(true);
                            }
                        }

                        //Respuesta cortando la ejecución del controller
                        return $q.reject(rejection);
                    }
                };
            }]);
})();
