(function () {
    'use strict';

    var filtersModule = angular.module('kafhe.services');

    /**
     * ng-repeat="n in [] | range:100"
     */
    filtersModule.filter('range', function () {
        return function (input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++) {
                input.push(i);
            }
            return input;
        };
    });

})();
