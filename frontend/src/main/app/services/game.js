(function () {
    'use strict';

    //Defino el módulo para importarlo como dependencia donde se requiera
    var authModule = angular.module('kafhe.services');

    //Defino el servicio concreto del Game
    authModule.factory('KGame',
        ['$rootScope', '$cookies', '$location', '$translate', 'API', '$q',
            function ($rootScope, $cookies, $location, $translate, API, $q) {
                /**
                 * Pide al webservice los datos de la partida y la información de pedidos y habilidades
                 * @param callback Función callback. Se le pasa la info de: user, meals, drinks, skills
                 * @returns {*}
                 */
                var getGameData = function (callback) {
                    // Saco los datos de llamadas al api
                    return $q.all([
                        API.user().me().$promise,
                        API.game().data().$promise
                    ]).then(function (results) {
                        // Proceso los datos
                        var meals = {};
                        results[1].data.meals.forEach(function (meal) {
                            meals[meal.id] = meal;
                        });
                        var drinks = {};
                        results[1].data.drinks.forEach(function (drink) {
                            drinks[drink.id] = drink;
                        });
                        var skills = {};
                        results[1].data.skills.forEach(function (skill) {
                            skills[skill.id] = skill;
                        });
                        var talents = {};
                        results[1].data.talents.forEach(function (talent) {
                            talents[talent.id] = talent;
                        });
                        var places = {};
                        results[1].data.places.forEach(function (place) {
                            places[place.id] = place;
                        });
                        var objects = {};
                        results[1].data.objects.forEach(function (object) {
                            objects[object.id] = object;
                        });

                        callback(
                            results[0].data.user,
                            meals,
                            drinks,
                            skills,
                            talents,
                            places,
                            objects
                        );
                    });
                };

                //Expongo los métodos del servicio
                return {
                    getGameData: getGameData
                };
            }
        ]);
})();
