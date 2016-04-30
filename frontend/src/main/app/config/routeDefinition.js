(function () {
    'use strict';

    angular.module('kafhe.config')
        .constant('ROUTES', {
            login: '/',
            loginValidation: '/login',
            error: '/error',
            home: '/home',
            explore: '/explore',
            team: '/team',
            breakfast: '/breakfast',
            profile: '/profile'
        });
})();
