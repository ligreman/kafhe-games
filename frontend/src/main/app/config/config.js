(function () {
    'use strict';

    // módulo que contiene Strings de configuración
    angular.module('kafhe.config')
        .constant('CONFIG', {
            //webServiceUrl: 'http://okapi-lovehinaesp.rhcloud.com/',
            webServiceUrl: 'http://localhost:8080/api/',

            // IDIOMAS
            defaultLanguage: 'es',
            fallbackLanguage: 'es',
            languages: {
                spanish: 'es',
                english: 'en'
            },

            // Seguridad
            sessionCookieName: 'KAFHE',
            //Códigos de error de sesión, que provocarán que se eche al usuario a la página de login
            errorCodesSession: [
                'errUserPassNotValid', 'errSession'
            ],

            // CONSTANTES
            constReputationToToastProportion: 100,
            constCommonSkills: 'common'
        });
})();
