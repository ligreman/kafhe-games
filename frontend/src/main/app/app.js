(function () {
    'use strict';

    // Módulo principal con sus [dependencias]
    var app = angular.module('kafhe', [
        'ngRoute',
        'ngResource',
        'ngCookies',
        'ngMaterial',
        'ngMessages',
        // 'ngDraggable',
        'kafhe.config',
        'kafhe.controllers',
        'kafhe.services',
        'kafhe.directives',
        'angular-growl',
        'angular-timeline',
        'pascalprecht.translate',
        'angular-toArrayFilter'
    ]);

    //Creo los módulos de controladores, utiles y servicios en blanco, y los iré llenando más adelante
    angular.module('kafhe.config', []);
    angular.module('kafhe.controllers', []);
    angular.module('kafhe.services', []);
    angular.module('kafhe.directives', []);

    //Para controles que hay que hacer cuando se cambia de ruta, por ejemplo autenticación
    app.run(['$rootScope', 'KSession', function ($rootScope, KSession) {
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            //A ver si a donde voy requiere que esté autenticado
            if (next.access !== undefined && next.access.loginRequired) {
                //TODO Aquí puedo comprobar si requiere o no que sea admin

                //Compruebo que estoy autorizado para ver la página que quiero ver
                KSession.authorize();
            }
        });

    }]);

    app.config(['$logProvider', function ($logProvider) {
        // DEBUG - $log.debug()
        $logProvider.debugEnabled(true);
    }]);


    //Configuramos el idioma por defecto
    app.config(['$translateProvider', 'CONFIG', function ($translateProvider, CONFIG) {
        //Indicamos que sanee las cadenas usadas, el idioma por defecto, el idioma
        // de fallback (si no encuentra una cadena en el idioma actual la busca en el de fallback,
        // e indicamos que usaremos cookies para guardar la elección del usuario
        $translateProvider
            .useSanitizeValueStrategy('escape')
            .preferredLanguage(CONFIG.defaultLanguage)
            .fallbackLanguage(CONFIG.fallbackLanguage)
            .useLocalStorage();

        // Otra itnerpolación para plurarles y genero
        $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
    }]);

    //Configuración de httpProvider y growls
    app.config(['$httpProvider', 'growlProvider', function ($httpProvider, growlProvider) {
        //Inserto un interceptor para todas las peticiones al httpProvider
        $httpProvider.interceptors.push('KInterceptor');
        // Interceptor para poner mensajes automaticamente, leyendo del servidor un
        // array "messages": [ {"text":"this is a server message", "severity": "warn/info/error"}, "title":"optional" ]
        $httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);

        growlProvider.globalReversedOrder(true);
        //growlProvider.globalDisableIcons(true);
        growlProvider.globalTimeToLive(5000);
        growlProvider.globalDisableCountDown(true);
        //growlProvider.globalTimeToLive({success: 1000, error: 2000, warning: 3000, info: 4000});
    }]);

    // Configuración de color
    app.config(['$mdThemingProvider', function ($mdThemingProvider) {
        var accent = $mdThemingProvider.extendPalette('grey', {
            'A700': 'FDD835'
        });
        var warn = $mdThemingProvider.extendPalette('red', {
            'A700': '9C27B0'
        });

        // Register the new color palette map with the name <code>neonRed</code>
        $mdThemingProvider.definePalette('myAccent', accent);
        $mdThemingProvider.definePalette('myWarn', warn);

        $mdThemingProvider.theme('default')
            .dark()
            .primaryPalette('green', {
                'default': '800',
                'hue-1': '100',
                'hue-2': '600',
                'hue-3': '900'
            })
            .accentPalette('myAccent', {
                'default': '500',
                'hue-1': '200',
                'hue-2': '700',
                // Amarillo
                'hue-3': 'A700'
            })
            .warnPalette('red', {
                'default': 'A700',
                'hue-1': 'A100',
                'hue-2': '900',
                // Morado
                'hue-3': '500'
            });
    }]);
})();
