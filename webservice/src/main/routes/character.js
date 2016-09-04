'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        validator = require('validator'),
        utils = require('../modules/utils'),
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
        res.json({
            "data": {
                "character": usuario.game.character//responseUtils.censureUser(usuario)
            },
            "session": {
                "access_token": req.authInfo.access_token,
                "expire": 1000 * 60 * 60 * 24 * 30
            },
            "error": ""
        });
    });

    /**
     * GET /character/new
     * Contrata a un personaje nuevo de nivel 1
     */
    characterRouter.get('/new', function (req, res, next) {
        // El objeto user
        var usuario = req.user;

        // Compruebo si puedo contratar
        if (usuario.game.character !== null) {
            console.tag('TEAM-HIRE').error('Límite de mercenarios alcanzado');
            utils.error(res, 400, 'errTeamMaxMercs');
            return;
        }

        // Genero un objeto de mercenario nuevo
        var newChar = new models.Character({
            name: String,
            level: Number,
            location: {
                place: String,
                level: Number // 0 superficie
            },
            stats: {
                damage: Number,
                reduction: Number,
                life: Number,
                toxicity: Number,
                perception: Number,
                reflexes: Number,
                stealth: Number,
                hunger: Number,
                fatigue: Number,
                venom: Number,
                healing: Number
            },
            score: Number,
            talents: {
                points: Number,
                combat: [{
                    talent: String,
                    level: Number
                }],
                survival: [{
                    talent: String,
                    level: Number
                }],
                exploration: [{
                    talent: String,
                    level: Number
                }]
            },
            log: [LogSchema],
            skill_slots: Number,
            skills: [{
                skill: String,
                uses: Number
            }],
            inventory_slots: Number,
            inventory: {
                object: String,
                uses: Number
            },
            weapon: {
                name: String,
                ammo: Number,
                damage: Number,
                accuracy: Number,
                level: Number
            }
        });

        // Guardo el personaje
        newChar.save(function (err) {
            if (err) {
                console.tag('MONGO').error(err);
                utils.error(res, 400, 'errMongoSave');
                return;
            } else {
                // pongo el id del personaje creado en el usuario
                usuario.game.character = newChar._id;

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
            }
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
            utils.error(res, 400, 'errTeamMaxMercs');
            return;
        }

        models.Character.findById(usuario.game.character._id, function (err, char) {
            if (err) {
                console.tag('MONGO').error(err);
                utils.error(res, 400, 'errMongoSave');
                return;
            } else {
                // Borro el pj
                char.remove(function (err, charRemoved) {
                    if (err) {
                        console.tag('MONGO').error(err);
                        utils.error(res, 400, 'errMongoSave');
                        return;
                    } else {
                        // Guardo el objeto usuario sin pj
                        usuario.game.character = null;

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
                    }
                });
            }
        });
    });

    // Asigno los router a sus rutas
    app.use('/api/character', characterRouter);
};
