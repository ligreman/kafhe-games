'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        adminRouter = express.Router(),
        bodyParser = require('body-parser'),
        config = require('../modules/config'),
        utils = require('../modules/utils'),
        crypto = require('crypto'),
        mongoose = require('mongoose'),
        models = require('../models/models')(mongoose);

    //**************** USER ROUTER **********************
    //Middleware para estas rutas
    adminRouter.use(bodyParser.json());
    adminRouter.use(passport.authenticate('basic', {
        session: false
        //failureRedirect: '/error/session'
    }));

    /**
     * GET /admin/login
     * Hace login con el admin
     */
    adminRouter.get('/login', function (req, res, next) {
        res.json({
            "login": true,
            "error": ""
        });
    });

    /**
     * GET /admin/user/all
     * Obtiene la información del usuario
     */
    adminRouter.get('/user/all', function (req, res, next) {
        // Saco la lista de jugadores de todo Kafhe
        models.User
            .find({})
            .select('username alias game.afk game.gamedata')
            .populate('game.gamedata')
            .exec(function (error, playerList) {
                if (error) {
                    console.tag('ADMIN-MONGO').error(error);
                    //res.redirect('/error/errUserListNotFound');
                    utils.error(res, 400, 'errUserListNotFound');
                    return;
                }

                res.json({
                    "data": {
                        "players": playerList
                    },
                    "error": ""
                });
            });
    });

    /**
     * POST /admin/user/new
     * Crea un nuevo usuario
     */
    adminRouter.post('/user/new', function (req, res, next) {
        var params = req.body,
            alias = null;

        if (!params.username) {
            console.tag('ADMIN-USER-NEW').error('No se ha proporcionado el nombre de usuario a crear');
            //res.redirect('/error/errAdminNewUserNoUsername');
            utils.error(res, 400, 'errAdminNewUserNoUsername');
            return;
        }

        // Alias
        if (params.alias) {
            alias = params.alias;
        }

        //Hasheo el username y token
        var shasum = crypto.createHash('sha512');
        shasum.update(config.DEFAULT_PASSWORD);
        var pass = shasum.digest('hex');

        var user = new models.User({
            username: params.username,
            password: pass,
            alias: alias
        });

        user.save(function (err) {
            if (err) {
                console.tag('ADMIN-MONGO').error(err);

                if (err.code === 11000) {
                    //res.redirect('/error/errMongoDuplicatedUsername');
                    utils.error(res, 400, 'errMongoDuplicatedUsername');

                } else {
                    //res.redirect('/error/errMongoSave');
                    utils.error(res, 400, 'errMongoSave');
                }
                return;
            } else {
                res.json({
                    "result": true,
                    "error": ""
                });
            }
        });
    });

    /**
     * POST /admin/game/new
     * Crea una nueva partida con una lista de usuarios
     */
    adminRouter.post('/game/new', function (req, res, next) {
        var params = req.body,
            userIds = params.users,
            usersObjectId = [],
            repeat = params.repeat,
            gameId = null;

        // Creo un objeto partida nuevo
        var game = new models.Game({
            repeat: repeat,
            players: userIds
        });

        game.save(function (err) {
            if (err) {
                console.tag('ADMIN-MONGO').error(err);
                //res.redirect('/error/errMongoSave');
                utils.error(res, 400, 'errMongoSave');
                return;
            } else {
                // Ahora actualizo los usuarios
                gameId = game._id;
                saveUsers(userIds, res);

            }
        });

        // A cada usuario le pongo el campo game nuevo
        // y le quito de la partida en que esté actualmente, si es que está en una


        // Función que guarda los resultados en mongo
        function saveUsers(userIds, res) {
            var promises = [];
            userIds.forEach(function (idUser) {
                promises.push(userPromise(idUser));
            });

            // Lanzo la actualización de los usuarios
            Q.allSettled(promises)
                .then(function (users) {
                    res.json({
                        mongo: true
                    });
                }).done();
        }

        // Función que crea un promise
        function userPromise(userId) {
            var deferred = Q.defer();

            // A su vez llama a dos funciones asíncronas de mongo
            // para limpiar su campo Game y para eliminarlo de la partida actual
            Q.fcall(
                function () {
                    return userId;
                })
                .then(findUser)
                .then(removeUserFromGame)
                .done(function () {
                    deferred.resolve();
                }, function (error) {
                    // We get here if any fails
                    console.tag('ADMIN-NEW-GAME').error('Error actualizando usuarios: ' + error);
                    deferred.reject(new Error(error));
                });

            return deferred.promise;
        }

        //TODO  esto en un modulo de usuarios o algo así
        function findUser(userId) {
            var deferred = Q.defer();

            models.User.find({_id: userId})
                .exec(function (error, user) {
                    if (error) {
                        deferred.reject(error);
                    }

                    deferred.resolve(user);
                });

            return deferred.promise;
        }

        function removeUserFromGame(user) {
            var deferred = Q.defer();

            //Cambia al usuario de game
            user.game.gamedata = gameId;

            user.save(function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });

            return deferred.promise;
        }
    });


    // Asigno los router a sus rutas
    app.use('/api/admin', adminRouter);
};
