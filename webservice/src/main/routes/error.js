'use strict';

module.exports = function (app) {
    var console = process.console;

    /*app.all('*', function (req, res) {
     console.log("OPTIONS");
     });*/

    // Error al hacer login. Envío login:false para que el front borre la cookie
    app.all('/error/login', function (req, res) {
        console.tag('ERROR').error('Usuario o contraseña incorrectos');
        res.status(401).json({
            "login": false,
            "error": "errUserPassNotValid"
        });
    });

    // Error en la sesión. Envío login:false para que el front borre la cookie
    app.all('/error/session', function (req, res) {
        console.tag('ERROR').error('Error en la sesión');
        res.status(403).json({
            "login": false,
            "error": "errSession"
        });
    });


    // Ruta de error concreto
    /*app.all('/error/:code', function (req, res) {
     var code = req.params.code;
     console.tag('ERROR').error('Error: ' + code);
     res.status(400).json({
     "data": "",
     "error": code
     });
     });

     // Ruta de error general
     app.all('/error', function (req, res) {
     console.tag('ERROR').error('Error en el servicio');
     res.status(500).json({
     "data": "",
     "error": "Error en el servicio"
     });
     });*/
};
