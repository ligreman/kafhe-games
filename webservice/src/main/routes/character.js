'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        validator = require('validator'),
        config = require('../modules/config'),
        talentUtils = require('../modules/talentUtils'),
        responseUtils = require('../modules/responseUtils'),
        characterRouter = express.Router(),
        clone = require('clone'),
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
            console.tag('CHAR-HIRE').error('No se puede contratar en este momento');
            responseUtils.responseError(res, 400, 'errCharacterHireStatus');
            return;
        }

        // Compruebo si puedo contratar por límite
        if (usuario.game.character !== null) {
            console.tag('CHAR-HIRE').error('Límite de mercenarios alcanzado');
            responseUtils.responseError(res, 400, 'errTeamMaxMercs');
            return;
        }

        // Compruebo si puedo contratar por dinero
        if (usuario.game.tostolares < config.CONSTANTS.MERC_HIRE_COST) {
            console.tag('CHAR-HIRE').error('No tienes dinero para contratar');
            responseUtils.responseError(res, 400, 'errCharacterHireNoMoney');
            return;
        }

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
            // usuario.game.character = newChar._id;
            usuario.game.character = newChar;

            // Quito dinero
            usuario.game.tostolares = usuario.game.tostolares - config.CONSTANTS.MERC_HIRE_COST;

            responseUtils.saveUserAndResponse(res, usuario, req.authInfo.access_token);
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
            console.tag('CHAR-HIRE').error('Límite de mercenarios alcanzado');
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

                responseUtils.saveUserAndResponse(res, usuario, req.authInfo.access_token);
            });
        });
    });

    /**
     * POST /character/levelup
     * Sube de nivel
     * @params Body array: ids de talentos
     */
    characterRouter.post('/levelup', function (req, res, next) {
        // El objeto user
        var usuario = req.user,
            params = req.body;

        // Comprueba si tengo pj y si tengo puntos de talento disponibles
        if (usuario.game.character === null) {
            console.tag('CHAR-LEVELUP').error('No existe el personaje');
            responseUtils.responseError(res, 400, 'errCharacterNotFound');
            return;
        }
        if (usuario.game.character.talents.points < params.talents.length) {
            console.tag('CHAR-LEVELUP').error('No tienes suficientes puntos de talento');
            responseUtils.responseError(res, 400, 'errCharacterNotEnoughTalentPoints');
            return;
        }

        // Agrupo por talento los nuevos y sacar lista de únicos
        var nuevos = {};
        params.talents.forEach(function (newTalent) {
            nuevos[newTalent] = {
                id: newTalent,
                type: null
            };
        });

        // Talentos que ya tiene el personaje
        var charTalents = [];
        usuario.game.character.talents.combat.forEach(function (talent) {
            charTalents.push(talent);
        });
        usuario.game.character.talents.exploration.forEach(function (talent) {
            charTalents.push(talent);
        });
        usuario.game.character.talents.survival.forEach(function (talent) {
            charTalents.push(talent);
        });

        // Saco todos los talentos
        models.Talent.find({}, function (err, talents) {
            var sourceTalents = {};
            // Genero un objeto de talentos
            talents.forEach(function (thisT) {
                sourceTalents[thisT.id] = thisT;
            });

            // Compruebo que los ids existen
            var existen = true;

            // Recorro cada uno a ver si existe
            nuevos.forEach(function (newT) {
                // A ver si lo encuentro
                if (!sourceTalents[newT.id]) {
                    existen = false;
                } else {
                    nuevos[newT.id].type = sourceTalents[newT.id].branch;
                }
            });

            if (!existen) {
                console.tag('CHAR-LEVELUP').error('No existe alguno de los talentos');
                responseUtils.responseError(res, 400, 'errCharacterTalentNotFound');
                return;
            }

            // Verifico si puedo adquirir esos talentos por las dependencias. Entiendo que vienen por orden de lvlup
            var yaLosTengo = false, dependenciasCorrectas = true;
            var auxCharTalents = clone(charTalents, false);
            params.talents.forEach(function (newTalent) {
                // Miro a ver si ya tengo alguno de esos talentos
                if (charTalents.indexOf(newTalent) !== -1) {
                    yaLosTengo = true;
                }

                // Los requisitos
                var requiere = sourceTalents[newTalent].required;

                // Miro cada requisito de este talento si lo cumple
                var cumpleRequisitos = true;
                requiere.forEach(function (requisito) {
                    // Si no tengo ese talento
                    if (auxCharTalents.indexOf(requisito) === -1) {
                        dependenciasCorrectas = false;
                        cumpleRequisitos = false;
                    }
                });

                // Si cumple con los requisitos, tengo en cuenta que se ha añadido este talento, para verificar
                // las dependencias del siguiente
                if (cumpleRequisitos) {
                    auxCharTalents.push(newTalent);
                }
            });

            if (!dependenciasCorrectas || yaLosTengo) {
                console.tag('CHAR-LEVELUP').error('Ya tenías alguno de los talentos o no cumples los requisitos para adquirirlos');
                responseUtils.responseError(res, 400, 'errCharacterTalentDependencyFail');
                return;
            }

            //++++ Está todo correcto así que guardo cambios

            // Añado los talentos elegidos a los del pj
            nuevos.forEach(function (nuevoT) {
                usuario.game.character.talents[nuevoT.branch].push(nuevoT.id);
            });

            // Resta los puntos de talentos empleados
            usuario.game.character.talents.points -= params.talents.length;

            responseUtils.saveUserAndResponse(res, usuario, req.authInfo.access_token);
        });
    });

    /**
     * POST /character/changename
     * Cambia el nombre
     * @params Body name: nombre del personaje
     */
    characterRouter.post('/changename', function (req, res, next) {
        // El objeto user
        var usuario = req.user,
            params = req.body,
            newName = params.name;

        // Compruebo si tengo personaje
        if (usuario.game.character === null) {
            console.tag('CHAR-CHANGENAME').error('No hay personaje al que cambiar el nombre');
            responseUtils.responseError(res, 400, 'errCharacterNotFound');
            return;
        }

        // Compruebo si puedo cambiarlo
        if (usuario.game.character.name_changed) {
            console.tag('CHAR-CHANGENAME').error('No puedes cambiar el nombre del personaje más veces');
            responseUtils.responseError(res, 400, 'errCharacterCantChangeName');
            return;
        }

        // Compruebo que el nuevo nombre cumple los requisitos
        if (!validator.matches(newName, config.CONSTANTS.STR_VALID_REGEXP) || !validator.isLength(newName, 3, 30)) {
            console.tag('CHAR-NAMENOTVALID').error('Nuevo nombre erróneo');
            responseUtils.responseError(res, 400, 'errCharacterWrongNewName');
            return;
        }

        // Compruebo que no existe ya el nuevo nombre
        models.Character.find({})
            .exec(function (error, chars) {
                if (error) {
                    console.tag('MONGO').error(err);
                    responseUtils.responseError(res, 400, 'errMongo');
                    return;
                }

                // A ver si existe
                chars.forEach(function (char) {
                    if (char.name.toLowerCase() === newName.toLowerCase()) {
                        console.tag('CHAR-NAMEALREADYEXISTS').error('Ya existe ese nombre');
                        responseUtils.responseError(res, 400, 'errCharacterNameAlreadyExists');
                        return;
                    }

                    // No existe así que lo guardo
                    usuario.game.character.name_changed = true;
                    usuario.game.character.name = newName;

                    // Guardo los cambios al personaje y al usuario
                    responseUtils.saveCharacterAndUserAndResponse(res, usuario, req.authInfo.access_token);
                });
            });

    });

    // Asigno los router a sus rutas
    app.use('/api/character', characterRouter);
};
