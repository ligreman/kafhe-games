'use strict';

module.exports = function (app) {
    var console = process.console;

    var express       = require('express'),
        passport      = require('passport'),
        utils         = require('../modules/utils'),
        responseUtils = require('../modules/responseUtils'),
        userRouter    = express.Router(),
        mongoose      = require('mongoose'),
        models        = require('../models/models')(mongoose);

    //**************** USER ROUTER **********************
    //Middleware para estas rutas
    userRouter.use(passport.authenticate('bearer', {
        session: false
        //failureRedirect: '/error/session'
    }));

    /**
     * GET /user
     * Obtiene la información del usuario
     */
    userRouter.get('/', function (req, res, next) {
        res.json({
            "data": {
                "user": responseUtils.censureUser(req.user)
            },
            "session": {
                "access_token": req.authInfo.access_token,
                "expire": 1000 * 60 * 60 * 24 * 30
            },
            "error": ""
        });
    });

    /**
     * GET /user/list
     * Obtiene la información de los usuarios de esta partida
     */
    userRouter.get('/list', function (req, res, next) {
        // Saco la lista de jugadores de la partida
        var players = req.user.game.gamedata.players;

        // Hago una búsqueda de esa lista de usuarios
        models.User
            .find({"_id": {"$in": players}})
            .select('username alias avatar game.afk game.stats.reputation game.level')
            .exec(function (error, playerList) {
                if (error) {
                    console.tag('MONGO').error(error);
                    //res.redirect('/error/errUserListNotFound');
                    utils.error(res, 400, 'errUserListNotFound');
                    return;
                }

                res.json({
                    "data": {
                        "players": playerList
                    },
                    "session": {
                        "access_token": req.authInfo.access_token,
                        "expire": 1000 * 60 * 60 * 24 * 30
                    },
                    "error": ""
                });
            });
    });

    // Asigno los router a sus rutas
    app.use('/user', userRouter);
};
