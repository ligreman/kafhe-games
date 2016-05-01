'use strict';

var console  = process.console,
    Q        = require('q'),
    mongoose = require('mongoose'),
    modelos  = require('../models/models')(mongoose),
    base64   = require('base-64'),
    crypto   = require('crypto');

/**
 * Crea una sesión de usuario tras un login correcto. Para ello genera un token de acceso que devuelve, y guarda la sesión en Mongo
 * @param username
 * @returns {*}
 */
var createSession = function (username) {
    var token        = generateToken(username),
        access_token = generateAccessToken(username, token),
        defer        = Q.defer(),
        fecha        = new Date();

    console.log('Creo la sesión');

    modelos.Session.create({
        "username": username,
        "token": token,
        "timestamp": fecha.getTime()
    }, function (err) {
        if (err) {
            console.log('Error en el creado');
            defer.reject(err);
        } else {
            console.log('Resuelvo el creado');
            defer.resolve(access_token);
        }
    });

    return defer.promise;
};

/**
 * Borra las sesiones de un usuario dado por su username
 * @param username
 * @returns {*}
 */
var deleteSessions = function (username) {
    var defer = Q.defer();

    console.log('Borro la sesión: ' + username);

    modelos.Session.remove({"username": username}, function (err) {
        if (err) {
            console.log('Error en el borrado');
            defer.reject(err);
        } else {
            console.log('Resuelvo el borrado');
            defer.resolve(username);
        }
    });

    return defer.promise;
};

/**
 * Extrae el username y el token de una variable de access_token
 * @param access_token
 * @returns {*}
 */
var extractSessionFromAccessToken = function (access_token) {
    //Decodifica el base64
    var decoded = '';
    try {
        decoded = base64.decode(access_token);
    } catch (error) {
        console.log(error);
        return false;
    }
    console.log(access_token);
    console.log(decoded);
    //Extraigo el username y token
    decoded = decoded.split('#');

    if (decoded.length === 2) {
        return {
            username: decoded[0],
            token: decoded[1]
        };
    } else {
        return false;
    }
};

module.exports = {
    generateToken: generateToken,
    deleteSessions: deleteSessions,
    createSession: createSession,
    extractSessionFromAccessToken: extractSessionFromAccessToken
};

/*********** FUNCIONES PRIVADAS *****************/
function generateToken(username) {
    var token = crypto.randomBytes(256).toString('hex');
    token = base64.encode(token);

    //Hasheo el username y token
    var shasum = crypto.createHash('sha512');
    shasum.update(username + token);

    token = shasum.digest('hex');

    return token;
}

function generateAccessToken(username, token) {
    return new Buffer(username + '#' + token).toString('base64');
}
