(function () {
    'use strict';

    //Idioma español
    angular.module('kafhe').config(['$translateProvider', function ($translateProvider) {
        var espanol = {
            // MENU
            'menuGames': 'Juegos',
            'menuExplore': 'Explorar',
            'menuTeam': 'Equipo',
            'menuStorage': 'Taller',
            'menuShop': 'Tienda',
            'menuBreakfast': 'Cafetería',
            'menuProfile': 'Perfil',

            // TEXTOS - GENERAL
            'textError': 'Error',
            'textErrors': 'Errores',
            'textCancel': 'Cancelar',
            'textAccept': 'Aceptar',
            'textContinue': 'Continuar',
            'textYes': 'Sí',
            'textNo': 'No',
            'tostem': 'Tostem',
            'rune': 'Runa',

            // TIPOS
            'bladed': 'Cortante',
            'blunt': 'Contundente',
            'piercing': 'Perforante',
            'light': 'Ligera',
            'medium': 'Media',
            'heavy': 'Pesada',

            // ELEMENTOS
            'fire': 'Fuego',
            'water': 'Agua',
            'earth': 'Tierra',
            'air': 'Aire',

            // MATERIALES
            'madera': 'Madera',

            // FRECUENCIAS
            'common': 'Común',
            'uncommon': 'Infrecuente',
            'rare': '{GENDER, select, male{Raro} female{Rara} other{}}',
            'extraordinary': '{GENDER, select, male{Extraordinario} female{Extraordinaria} other{}}',
            'legendary': '{GENDER, select, male{Extraordinario} female{Extraordinaria} other{}}Legendario',

            // INTERFAZ - HEADER
            'headerUser': 'Usuario: ',
            'headerLogout': 'Salir',

            // INTERFAZ - LOGIN
            'loginSignInButton': 'Entrar',
            'loginUserLabel': 'Usuario',
            'loginPasswordLabel': 'Contraseña',

            // INTERFAZ - PANTALLA DESAYUNO
            'textNewOrder': 'Hacer pedido',
            'textChangeOrder': 'Cambiar el desayuno',
            'textCancelOrder': 'Eliminar el desayuno',
            'textLastDayOrder': 'Pedir lo del otro día',
            'textOrderNoItoTitle': 'El desayuno no es ITO',
            'textOrderNoItoContent': 'El desayuno que vas a pedir no es ITO, ¿es correcto o se te ha olvidado marcarlo?',
            'textYaMeParecia': 'Ya me parecía a mí...',
            'textOrderChanged': 'Desayuno actualizado',
            'textOrderDeleted': 'Pedido del desayuno retirado',
            'textNoLastOrder': 'Omelettus no tiene constancia de que el otro día tomaras desayuno alguno, ¡hereje!',

            // INTERFAZ - SHOP
            'textShopBuyTitle': 'Confirma la compra',
            'textShopBuy': '¿Quieres comprar {{name}} por {{points}} tostólares?',
            'textShopButtonBuy': 'Comprar por {{cost}} tostólares',

            // INTERFAZ - HABILIDADES
            'textDuration': 'Duración',
            'textUses': 'Usos restantes',
            'textTargets': 'Nº de objetivos',
            'textCost': 'Coste en puntos de tueste',
            'textExecute': 'Ejecutar habilidad',

            // INTERFAZ - PANTALLA FORJA
            'textCombineTostemsInFurnace': 'Hornear tostems',
            'textCombineRunesInFurnace': 'Hornear runas',
            'textForgeWeapon': 'Forjar arma',
            'textForgeArmor': 'Forjar armadura',

            'okFurnaceTostems': 'Tostem horneado con éxito',
            'okFurnaceRunes': 'Runa horneada con éxito',
            'okForgeWeapon': 'Arma forjada con éxito',
            'okForgeArmor': 'Armadura forjada con éxito',
            'errFurnaceNoValidTostems': 'No has seleccionado dos tostem válidos',
            'errFurnaceNoValidRunes': 'No has seleccionado dos runas válidas',
            'errForgeNoValidParams': 'No has seleccionado todos los ingredientes necesarios',

            // ERRORES - GENERAL
            'errGenericException': 'Ocurrió un error desconocido',
            'errServerException': 'El servidor no responde',

            // ERRORES - LOGIN
            'errUserPassNotValid': 'Usuario o contraseña no válidos',

            // ERRORES - SESSION
            'errSession': 'No se ha encontrado una sesión válida',
            //'errSessionUtils0002': 'La sesión ha caducado'


            // MENSAJES DE NOTIFICACIONES
            'nEquipArmor': 'Te has equipado la armadura: {{name}}.',
            'nEquipWeapon': 'Te has equipado el arma: {{name}}.',
            'nEquipDestroyArmor': 'Has destruido tu armadura {{name}}, recuperando un Tostem de {{tostem}} de nivel {{tostemLvl}}; y Runas de: {{rune}} - {{rune2}}.',
            'nEquipDestroyWeapon': 'Has destruido tu arma {{name}}, recuperando un Tostem de {{tostem}} de nivel {{tostemLvl}}; y Runas de: {{rune}} - {{rune2}}.',
            'nFurnaceTostemSuccess': 'Has horneado con éxito un nuevo Tostem de {{element}} de nivel {{level}}.',
            'nFurnaceTostemFailure': 'Has fracasado horneando el Tostem. Has podido recuperar un Tostem de {{element}} de nivel {{level}}.',
            'nFurnaceRuneSuccess': 'Has horneado con éxito una nueva Runa de {{material}}.',
            'nFurnaceRuneFailure': 'Has fracasado horneando la Runa. Has podido recuperar una Runa de {{material}}.',
            'nForgeWeapon': 'Has forjado el arma {{name}}.',
            'nForgeArmor': 'Has forjado la armadura {{name}}.',
            'nFuryMode': '¡Has activado el modo furia!',
            'nFuryModeGame': 'Os habéis pasado con el pobre {{name}}. ¡Está furioso, os vais a enterar!'
        };

        $translateProvider.translations('es', espanol);
    }]);
})();
