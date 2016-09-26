(function () {
    'use strict';

    var shareModule = angular.module('kafhe.services');

    /**
     * Servicio para compartir información entre controladores, y de gestión de eventos
     */
    shareModule.factory('KShare', ['$rootScope',
        function ($rootScope) {
            //Comparte esta variable entre diferentes controladores
            var eventPrefix = 'KShare.',
                data = {};

            /**
             * Obtiene el valor de una clave
             * @param key
             * @returns el valor
             */
            var getData = function (key) {
                return data[key];
            };

            /**
             * Establece el valor de una clave
             * @param key clave
             * @param dato valor
             */
            var setData = function (key, dato) {
                data[key] = dato;
            };

            /**
             * Borrar una clave
             * @param key
             */
            var deleteData = function (key) {
                delete data[key];
            };

            /**
             * Obtiene el valor de una clave y la borra
             * @param key
             * @returns el valor
             */
            var getAndDeleteData = function (key) {
                var result = getData(key);
                deleteData(key);

                return result;
            };

            /**
             * Envía datos a los hijos emitiendo un evento por broadcast
             * @param key nombre del evento
             * @param datos información a enviar
             */
            var sendDataToChildren = function (key, datos) {
                $rootScope.$broadcast(eventPrefix + key, datos);
            };

            /**
             * Escucha un evento concreto
             * @param key nombre del evento a escuchar
             * @param listenerScope Scope desde el que se escucha
             * @param callback Función a ejecutar cuando salta el evento
             */
            var listenData = function (key, listenerScope, callback) {
                listenerScope.$on(eventPrefix + key, function (event, datos) {
                    //Llamo al callback al recibir el evento
                    callback(datos);
                });
            };

            /**
             * Establece el valor de una clave y la envía en un evento
             * @param key clave y nombre del evento emitido
             * @param datos información guardada y enviada
             */
            var setAndSendData = function (key, datos) {
                setData(key, datos);
                sendData(key, datos);
            };

            //Expongo los métodos del servicio
            return {
                getData: getData,
                getAndDeleteData: getAndDeleteData,
                setData: setData,
                setAndSendData: setAndSendData,
                sendData: sendDataToChildren,
                listenData: listenData,
                deleteData: deleteData
            };
        }
    ]);


})();
