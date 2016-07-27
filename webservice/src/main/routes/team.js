'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        validator = require('validator'),
        utils = require('../modules/utils'),
        config = require('../modules/config'),
        responseUtils = require('../modules/responseUtils'),
        teamRouter = express.Router(),
        bodyParser = require('body-parser'),
        mongoose = require('mongoose');

    //**************** SKILL ROUTER **********************
    //Middleware para estas rutas
    teamRouter.use(bodyParser.json());
    teamRouter.use(passport.authenticate('bearer', {
        session: false
        //failureRedirect: '/error/session'
    }));

    /*
     team/
     team/expell
     team/hire
     team/levelup
     */

    /**
     * GET /team/
     * Obtiene la lista de mercenarios del equipo
     */
    teamRouter.get('/', function (req, res, next) {
        // El objeto user
        var usuario = req.user,
            params = req.body,
            changes = false;

        // Actualizo los campos del usuario
        if (params.password && validator.isHexadecimal(params.password) && params.password.length === 128) {
            usuario.password = params.password;
            changes = true;
        }
        if (params.alias && validator.isValidString(params.alias) && validator.isLength(params.alias, 3, 30)) {
            usuario.alias = params.alias;
            changes = true;
        }
        if (params.avatar && validator.isURL(params.avatar, {protocols: ['http', 'https'], require_protocol: true})) {
            usuario.avatar = params.avatar;
            changes = true;
        }

        if (!changes) {
            console.tag('PROFILE-SAVE').error('No hay datos válidos que actualizar');
            //res.redirect('/error/errProfileNoValidData');
            utils.error(res, 400, 'errProfileNoValidData');
            return;
        }

        // Guardo el usuario
        usuario.save(function (err) {
            if (err) {
                console.tag('MONGO').error(err);
                //res.redirect('/error/errMongoSave');
                utils.error(res, 400, 'errMongoSave');
                return;
            } else {
                res.json({
                    "data": {
                        "user": responseUtils.censureUser(usuario)
                    },
                    "session": {
                        "access_token": req.authInfo.access_token,
                        "expire": 1000 * 60 * 60 * 24 * 30
                    },
                    "error": ""
                });
            }
        });
    });

    /**
     * GET /team/hire
     * Contrata a un mercenario nuevo de nivel 1
     */
    teamRouter.get('/hire', function (req, res, next) {
        // El objeto user
        var usuario = req.user;

        // Compruebo si puedo contratar
        if (usuario.game.team.members.length >= config.CONSTANTS.TEAM_MAX_MERCS) {
            console.tag('TEAM-HIRE').error('Límite de mercenarios alcanzado');
            utils.error(res, 400, 'errTeamMaxMercs');
            return;
        }

        // Genero un objeto de mercenario nuevo
        var newMerc = {};

        usuario.game.team.members.push(newMerc);

        // Guardo el usuario
        usuario.save(function (err) {
            if (err) {
                console.tag('MONGO').error(err);
                utils.error(res, 400, 'errMongoSave');
                return;
            } else {
                res.json({
                    "data": {
                        "user": responseUtils.censureUser(usuario)
                    },
                    "session": {
                        "access_token": req.authInfo.access_token,
                        "expire": 1000 * 60 * 60 * 24 * 30
                    },
                    "error": ""
                });
            }
        });
    });

    // Asigno los router a sus rutas
    app.use('/api/team', teamRouter);
};
