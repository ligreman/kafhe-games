(function () {
    'use strict';

    var myAppServices = angular.module('kafhe.services');

    // Servicio para el webservice del login.
    myAppServices.factory('API', ['$resource', '$cookies', 'CONFIG', function ($resource, $cookies, CONFIG) {

        return {
            // API de Session
            'session': function () {
                // Lo pongo aquí para que se ejecute en cada consulta, y no una sola vez
                var access_token = $cookies.get(CONFIG.sessionCookieName);

                return $resource(CONFIG.webServiceUrl + ':endpoint', {
                    endpoint: '',
                    username: '@username',
                    password: '@password'
                }, {
                    // método LOGIN, envía user y passwd
                    login: {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        params: {
                            endpoint: 'login'
                        }
                    },
                    logout: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'logout'
                        }
                    }
                });
            },

            // API de User
            'user': function () {
                var access_token = $cookies.get(CONFIG.sessionCookieName);

                return $resource(CONFIG.webServiceUrl + 'user/:endpoint', {endpoint: ''}, {

                    // Obtener la información del usuario actual y su partida
                    me: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: ''
                        }
                    },

                    // Obtener lista de usuarios de la partida
                    list: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'list'
                        }
                    }
                });
            },

            // API de Game
            'game': function () {
                var access_token = $cookies.get(CONFIG.sessionCookieName);

                return $resource(CONFIG.webServiceUrl + 'game/:endpoint', {endpoint: ''}, {

                    // Obtener la información del usuario actual y su partida
                    data: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'data'
                        }
                    },

                    // Versión de los datos
                    version: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'version'
                        }
                    }
                });
            },

            // API de Order
            'order': function () {
                var access_token = $cookies.get(CONFIG.sessionCookieName);

                return $resource(CONFIG.webServiceUrl + 'order/:endpoint', {endpoint: ''}, {

                    // Obtener lo que se puede pedir
                    mealanddrink: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'mealanddrink'
                        }
                    },

                    // Obtener lista de pedidos
                    list: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'list'
                        }
                    },

                    // Obtener lista de jugadores que ya metieron desayuno
                    status: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'status'
                        }
                    },

                    // Envía un nuevo pedido
                    create: {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + access_token,
                            'Content-Type': 'application/json'
                        },
                        params: {
                            endpoint: 'new'
                        }
                    },

                    // Elimina el pedido
                    delete: {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + access_token},
                        params: {
                            endpoint: 'delete'
                        }
                    },
                });
            },


            // API de desarrollo
            'dev': function () {
                return $resource(CONFIG.webServiceUrl + 'dev/:endpointA/:endpointB/:status', {
                    endpointA: '',
                    endpointB: ''
                }, {
                    resetmongo: {
                        method: 'GET',
                        params: {
                            endpointA: 'mongo'
                        }
                    },
                    gamestatus: {
                        method: 'GET',
                        params: {
                            endpointA: 'game',
                            endpointB: 'status'
                        }
                    }
                });
            }
        }

    }]);
})();
