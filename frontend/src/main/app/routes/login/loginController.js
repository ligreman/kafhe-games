(function () {
    'use strict';

    //Controlador de la pantalla de login
    angular.module('kafhe.controllers')
        .controller('LoginController',
            ['$scope', '$rootScope', '$log', '$location', 'API', 'ROUTES', 'KSession', 'KShare',
                function ($scope, $rootScope, $log, $location, API, ROUTES, KSession, KShare) {
                    // Limpio variables del controlador global
                    $scope.clearGlobalVars();

                    // Compruebo si estoy logueado
                    KSession.authorize(true);
                    // Si ya estoy logueado redirijo a la página home
                    if ($rootScope.kUserLogged !== undefined) {
                        $location.path(ROUTES.home);
                    }

                    $scope.login = {
                        username: '',
                        password: ''
                    };

                    // función a la que se llama al pulsar el botón del formulario del login
                    $scope.btnLogin = function () {
                        // Si no he metido usuario y contraseña no sigo
                        if ($scope.login.username === '' || $scope.login.password === '') {
                            return;
                        }

                        // Codifico el password
                        var SHA512 = new Hashes.SHA512;

                        // pasa como parámetros el usuario y password recogidos del formulario de login
                        API.session()
                            .login({
                                username: $scope.login.username,
                                password: SHA512.hex($scope.login.password)
                            }, function (response) {
                                //Proceso la respuesta del webservice
                                if (response === null || !response.data.login) {
                                    // Hay un error por lo que hago logout, por si acaso
                                    KSession.logout(true);
                                } else {
                                    // Generamos la sesión con el token y expiración que me llegan
                                    KSession.login(response.session.access_token, response.session.expire);
                                    $log.debug('Login OK');

                                    // Guardo que estoy logueado
                                    $rootScope.kUserLogged = $scope.login.username;

                                    //Voy a la página de validación de login
                                    $location.path(ROUTES.loginValidation);
                                }
                            });

                    };
                }]);
})();
