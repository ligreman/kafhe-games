'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        bodyParser = require('body-parser'),
        Q = require('q'),
        sessionUtils = require('../modules/sessionUtils'),
        loginRouter = express.Router(),
        logoutRouter = express.Router();


    //**************** LOGIN ROUTER **********************
    //Middleware para estas rutas
    loginRouter.use(bodyParser.urlencoded({extended: false}));
    loginRouter.use(passport.authenticate('local', {
        session: false,
        //successRedirect: '/ok',
        failureRedirect: '/error/login'
    }));

    /**
     * POST /login
     * Si se hace login correctamente, pasará aquí
     */
    loginRouter.post('/', function (req, res, next) {
        res.json({
            "login": true,
            "session": {
                "access_token": req.authInfo.access_token,
                // 30 días de expiración. Le paso el tiempo que le queda al token
                "expire": 1000 * 60 * 60 * 24 * 30
            },
            "error": ""
        });
    });

    //**************** LOGOUT ROUTER **********************
    logoutRouter.use(passport.authenticate('bearer', {
        session: false,
        failureRedirect: '/error/session'
    }));

    /**
     * GET /logout
     * Hace logout del servicio
     */
    logoutRouter.get('/', function (req, res, next) {
        // Una vez identificado con el token, hago logout borrando la sesión
        Q.fcall(
            function () {
                //Paso este parámetro a deleteSessions
                return req.user.username;
            })
            .then(sessionUtils.deleteSessions)
            .done(function () {
                res.json({
                    "logout": true,
                    "error": ""
                });
            }, function (error) {
                console.tag('MONGO').error(error);
                //res.redirect('/error/errLogout');
                utils.error(res, 400, 'errLogout');
                return;
            });
    });

    // Asigno los router a sus rutas
    app.use('/api/login', loginRouter);
    app.use('/api/logout', logoutRouter);
};
