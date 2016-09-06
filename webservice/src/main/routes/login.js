'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        bodyParser = require('body-parser'),
        Q = require('q'),
        sessionUtils = require('../modules/sessionUtils'),
        responseUtils = require('../modules/responseUtils'),
        loginRouter = express.Router(),
        logoutRouter = express.Router();


    //**************** LOGIN ROUTER **********************
    //Middleware para estas rutas
    loginRouter.use(bodyParser.urlencoded({extended: false}));
    loginRouter.use(passport.authenticate('local', {
        session: false
    }));

    /**
     * POST /login
     * Si se hace login correctamente, pasará aquí
     */
    loginRouter.post('/', function (req, res, next) {
        responseUtils.responseJson(res, {"login": true}, req.authInfo.access_token);
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
                responseUtils.responseJson(res, {"logout": true}, null);
            }, function (error) {
                console.tag('MONGO').error(error);
                responseUtils.responseError(res, 400, 'errLogout');
            });
    });

    // Asigno los router a sus rutas
    app.use('/api/login', loginRouter);
    app.use('/api/logout', logoutRouter);
};
