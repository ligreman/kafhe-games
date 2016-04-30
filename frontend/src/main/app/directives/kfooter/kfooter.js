(function () {
    'use strict';

    var app = angular.module('kafhe.directives');

    app.directive('kFooter', function () {
        var controlador = ['$scope', function ($scope) {
        }];

        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'app/directives/kfooter/kfooter.html',
            scope: true,
            controller: controlador
        };
    });
})();
