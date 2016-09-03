'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        utils = require('../modules/utils'),
        responseUtils = require('../modules/responseUtils'),
        gameRouter = express.Router(),
        bodyParser = require('body-parser'),
        Q = require('q'),
        mongoose = require('mongoose'),
        models = require('../models/models')(mongoose);

    //**************** ORDER ROUTER **********************
    //Middleware para estas rutas
    gameRouter.use(bodyParser.json());
    gameRouter.use(passport.authenticate('bearer', {
        session: false
        //failureRedirect: '/error/session'
    }));

    /**
     * GET /game/data
     * Obtiene la información general del juego
     */
    gameRouter.get('/data', function (req, res, next) {
        //Proceso y devuelvo los resultados
        var answer = function (skills, talents, objects, places, meals, drinks) {
            if (!skills || !talents || !objects || !places || !meals || !drinks) {
                console.tag('MONGO').error(err);
                utils.error(res, 400, 'errGameDataNotFound');
                return;
            } else {
                res.json({
                    "data": {
                        "skills": skills,
                        "objects": objects,
                        "places": places,
                        "talents": talents,
                        "meals": meals,
                        "drinks": drinks
                    },
                    "session": {
                        "access_token": req.authInfo.access_token,
                        "expire": 1000 * 60 * 60 * 24 * 30
                    },
                    "error": ""
                });
            }
        };

        // Lanzo las dos consultas a Mongo
        Q.all([
            models.Skill.find({}).exec(),
            models.Talent.find({}).exec(),
            models.Object.find({}).exec(),
            models.Place.find({}).exec(),
            models.Meal.find({}).exec(),
            models.Drink.find({}).exec()
        ]).spread(answer);
    });

    // Asigno los router a sus rutas
    app.use('/api/game', gameRouter);
};
