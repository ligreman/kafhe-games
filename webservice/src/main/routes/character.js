'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        validator = require('validator'),
        config = require('../modules/config'),
        responseUtils = require('../modules/responseUtils'),
        characterRouter = express.Router(),
        bodyParser = require('body-parser'),
        mongoose = require('mongoose'),
        models = require('../models/models')(mongoose);

    //**************** SKILL ROUTER **********************
    //Middleware para estas rutas
    characterRouter.use(bodyParser.json());
    characterRouter.use(passport.authenticate('bearer', {
        session: false
        //failureRedirect: '/error/session'
    }));

    /*
     G character/
     G character/new
     G character/delete
     P character/equip
     P character/levelup
     */

    /**
     * GET /character/
     * Obtiene el personaje del jugador
     */
    characterRouter.get('/', function (req, res, next) {
        // El objeto user
        var usuario = req.user;

        responseUtils.responseJson(res, {"character": usuario.game.character}, req.authInfo.access_token);
    });

    /**
     * GET /character/new
     * Contrata a un personaje nuevo de nivel 1
     */
    characterRouter.get('/new', function (req, res, next) {
        // El objeto user
        var usuario = req.user;

        // Compruebo si puedo contratar por estado de la partida
        if (usuario.game.gamedata.status === null || usuario.game.gamedata.status !== config.GAME_STATUS.WAITING) {
            console.tag('TEAM-HIRE').error('No se puede contratar en este momento');
            responseUtils.responseError(res, 400, 'errCharacterHireStatus');
            return;
        }

        // Compruebo si puedo contratar por límite
        if (usuario.game.character !== null) {
            console.tag('TEAM-HIRE').error('Límite de mercenarios alcanzado');
            responseUtils.responseError(res, 400, 'errTeamMaxMercs');
            return;
        }

        //TODO por dinero

        // Genero un objeto de mercenario nuevo
        var newChar = new models.Character({
            name: "Manolo",
            level: usuario.game.rank
        });

        // Guardo el personaje
        newChar.save(function (err) {
            if (err) {
                console.tag('MONGO').error(err);
                responseUtils.responseError(res, 400, 'errMongoSave');
                return;
            }

            // pongo el id del personaje creado en el usuario
            usuario.game.character = newChar._id;

            responseUtils.responseJson(res, usuario, req.authInfo.access_token);
        });
    });

    /**
     * GET /character/delete
     * Despide a un personaje
     */
    characterRouter.get('/delete', function (req, res, next) {
        // El objeto user
        var usuario = req.user;

        // Compruebo si puedo despedir
        if (usuario.game.character === null) {
            console.tag('TEAM-HIRE').error('Límite de mercenarios alcanzado');
            responseUtils.responseError(res, 400, 'errTeamMaxMercs');
            return;
        }

        models.Character.findById(usuario.game.character._id, function (err, char) {
            if (err) {
                console.tag('MONGO').error(err);
                responseUtils.responseError(res, 400, 'errMongoSave');
                return;
            }

            // Borro el pj
            char.remove(function (err, charRemoved) {
                if (err) {
                    console.tag('MONGO').error(err);
                    responseUtils.responseError(res, 400, 'errMongoSave');
                    return;
                }

                // Guardo el objeto usuario sin pj
                usuario.game.character = null;

                responseUtils.responseJson(res, usuario, req.authInfo.access_token);
            });
        });
    });

    // Asigno los router a sus rutas
    app.use('/api/character', characterRouter);
};
