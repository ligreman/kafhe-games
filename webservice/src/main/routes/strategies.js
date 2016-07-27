'use strict';

module.exports = function (app) {
    var console = process.console;

    var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        BearerStrategy = require('passport-http-bearer').Strategy,
        BasicStrategy = require('passport-http').BasicStrategy,
        mongoose = require('mongoose'),
        sessionUtils = require('../modules/sessionUtils'),
        Q = require('q'),
        models = require('../models/models')(mongoose);

    // Estrategia Local de Passport - Se usa para hacer login
    passport.use(new LocalStrategy(
        function (username, password, done) {
            models.User.findOne({"username": username}, 'username password', function (err, user) {
                // Compruebo si hay errores
                if (err) {
                    console.tag('PASSPORT-LOCAL').error('ERROR: ' + err);
                    return done(err);
                }

                if (!user) {
                    console.tag('PASSPORT-LOCAL').info('No se ha encontrado el username');
                    return done(null, false);
                }

                //Comparo con la de Mongo
                if (password === user.password) {
                    //Login correcto
                    console.tag('PASSPORT-LOCAL').info('Login correcto');

                    /**
                     * Lo primero de todo es una función que devuelva el parámetro de la primera async que quiero ejecutar.
                     * Los then no llevan parámetros en la llamada a la función, aunque siempre se pasa 1 que es el return
                     * de la anterior.
                     * En el done se ejecuta tanto si todo es correcto como si hay error, en dos funciones diferentes.
                     */
                    Q.fcall(
                        function () {
                            return username;
                        })
                        .then(sessionUtils.deleteSessions)
                        .then(sessionUtils.createSession)
                        .done(function (access_token) {
                            //Hago un return que resuelve el return general al ser el último
                            return done(null, user, {"access_token": access_token});
                        }, function (error) {
                            // We get here if any fails
                            console.tag('PASSPORT-LOCAL').error('Error creando la sesion del usuario: ' + error);
                            return done(null, false);
                        });
                } else {
                    console.tag('PASSPORT-LOCAL').info('El password es incorrecto');
                    return done(null, false);
                }
            });
        }
    ));

    // Estrategia Bearer de Passport - Utilizada para cualquier petición al API que tenga que ir autenticada
    passport.use(new BearerStrategy(
        function (access_token, done) {
            // Proceso el access_token para extraer el username y el token de autenticación
            var sessionData = sessionUtils.extractSessionFromAccessToken(access_token);

            //Si pasa algún error
            if (!sessionData) {
                //Falla ya que no pude extraer la sesión. Envío un false y mensaje de error
                console.tag('PASSPORT-BEARER').info('Token de sesión no válido');
                return done(null, false, {message: 'El token de sesión no es válido'});
            }

            models.Session.findOne({
                "username": sessionData.username,
                "token": sessionData.token
            }, function (err, session) {
                if (err) {
                    console.tag('PASSPORT-BEARER').error('ERROR: ' + err);
                    return done(err);
                }

                if (session) {
                    console.tag('PASSPORT-BEARER').info('Sesión correcta');

                    // Devolveré la información del usuario
                    models.User
                        .findOne({"username": sessionData.username})
                        //.select('-_id') // Si lo activo, luego no puedo hacer save
                        .populate('game.gamedata game.order.meal game.order.drink game.lastOrder.meal game.lastOrder.drink')
                        .exec(function (error, user) {
                            if (error) {
                                console.tag('PASSPORT-BEARER').error('Error obteniendo la información del usuario: ' + error);
                                return done(error);
                            }
                            if (user) {
                                return done(null, user, {"access_token": access_token});
                            } else {
                                console.tag('PASSPORT-BEARER').error('Error al buscar la información del usuario');
                                return done(null, false, {message: 'No existe esa sesión'});
                            }
                        });
                } else {
                    console.tag('PASSPORT-BEARER').error('Token de sesión incorrecto, no existe');
                    return done(null, false, {message: 'errSession'});
                }
            });
        }
    ));

    // Estrategia Basic de HTTP para la sección de administración
    passport.use(new BasicStrategy(
        function (userid, password, done) {
            console.log("BASIC: " + userid + ' ' + password);
            models.Admin.findOne({"username": userid}, 'username password', function (err, admin) {
                // Compruebo si hay errores
                if (err) {
                    console.tag('PASSPORT-BASIC').error('ERROR: ' + err);
                    return done(err);
                }

                if (!admin) {
                    console.tag('PASSPORT-BASIC').info('No se ha encontrado el username');
                    return done(null, false);
                }

                //Comparo con la de Mongo
                if (password === admin.password) {
                    //Login correcto
                    console.tag('PASSPORT-BASIC').info('Login de admin correcto');

                    return done(null, admin);
                } else {
                    console.tag('PASSPORT-BASIC').info('El password es incorrecto');
                    return done(null, false);
                }
            });
        }
    ));

    // Middleware para que se inicialice el passport
    app.use(passport.initialize());
};
