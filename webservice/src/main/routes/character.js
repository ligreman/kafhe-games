'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        validator = require('validator'),
        config = require('../modules/config'),
        talentUtils = require('../modules/talentUtils'),
        responseUtils = require('../modules/responseUtils'),
        characterUtils = require('../modules/characterUtils'),
        characterRouter = express.Router(),
        clone = require('clone'),
        Q = require('q'),
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
        if (usuario.game.gamedata.status === null || usuario.game.gamedata.status !== config.GAME_STATUS.waiting) {
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
        if (usuario.game.tostolares < config.DEFAULTS.character.hire_cost) {
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
            usuario.game.tostolares -= config.DEFAULTS.character.hire_cost;

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
     * POST /character/equip
     * Equipa algo al personaje. Si no tiene huecos libres hay que desequipar algo antes
     * @params Body array: id_equip de lo que equipar, id_unequip de lo que desequipar, type: weapon, skill, object
     */
    characterRouter.post('/equip', function (req, res, next) {
        // El objeto user
        var usuario = req.user,
            params = req.body;

        // Compruebo el estado de la partida
        if (usuario.game.gamedata.status !== config.GAME_STATUS.waiting) {
            console.tag('CHAR-EQUIP').error('No se permite esta acción en el estado actual de la partida');
            responseUtils.responseError(res, 400, 'errGameStatusNotAllowed');
            return;
        }

        // Compruebo si puedo equiparlo, dependiendo de lo que sea
        var canEquip = false, consultas = [];
        switch (params.type) {
            case 'weapon':
                if (!usuario.game.character.weapon.name || params.id_unequip) {
                    canEquip = true;
                    consultas.push(models.Weapon.find({"id": params.id_equip}).exec());

                    if (params.id_unequip) {
                        consultas.push(models.Weapon.find({"id": params.id_unequip}).exec());
                    }
                }
                break;
            case 'skill':
                if (usuario.game.character.skill_slots > usuario.game.character.skills.length || params.id_unequip) {
                    canEquip = true;
                    consultas.push(models.Skill.find({"id": params.id_equip}).exec());

                    if (params.id_unequip) {
                        consultas.push(models.Skill.find({"id": params.id_unequip}).exec());
                    }
                }
                break;
            case 'object':
                if (usuario.game.character.inventory_slots > usuario.game.character.inventory.length || params.id_unequip) {
                    canEquip = true;
                    consultas.push(models.Object.find({"id": params.id_equip}).exec());

                    if (params.id_unequip) {
                        consultas.push(models.Object.find({"id": params.id_unequip}).exec());
                    }
                }
                break;
        }

        // Verificar que el id_equip y id_unequip corresponden ambos a elementos del mismo tipo existentes
        Q.allSettled(consultas).then(function (results) {
            var resultado = true, equip = null, unequip = null, reason = null;

            // La petición de equip
            if (results[0].state !== "fulfilled") {
                resultado = false;
                reason = results[0].reason;
            } else {
                equip = results[0].value;
            }
            // La petición de unequip
            if (resultado && params.id_unequip && results[1].state === "fulfilled") {
                unequip = results[1].value;
            } else if (resultado && params.id_unequip && results[1].state !== "fulfilled") {
                resultado = false;
                reason = results[1].reason;
            }

            if (!resultado || equip.length !== 1 || (params.id_unequip && unequip.length !== 1)) {
                console.tag('CHAR-EQUIP').error('Error al recuperar el equipo: ' + reason);
                responseUtils.responseError(res, 400, 'errCharacterEquipNotFound');
                return;
            }

            // Todo ha ido bien hasta aquí
            equip = equip[0];
            if (unequip) {
                unequip = unequip[0];
            }

            // Compruebo si ambos elementos los he encontrado (indirectamente comprueba que son del mismo tipo con el switch previo)
            /*if (equip.length !== 1 || (params.id_unequip && unequip.length !== 1)) {
             console.tag('CHAR-EQUIP').error('No se ha encontrado el equipo');
             responseUtils.responseError(res, 400, 'errCharacterEquipNotFound');
             return;
             }*/

            // Compruebo si tengo dinero
            if (usuario.game.tostolares < equip.price) {
                console.tag('CHAR-HIRE').error('No tienes dinero para comprar');
                responseUtils.responseError(res, 400, 'errWeaponNoMoney');
                return;
            }

            //TODO Verificar que lo que quiero equipar puedo hacerlo por "requisitos" del elemento a equipar

            // Todas las comprobaciones correctas
            // Elimino equipo
            if (unequip) {
                usuario = characterUtils.unequip(usuario, unequip, params.type);

                if (usuario === false) {
                    console.tag('CHAR-HIRE').error('Error desequipando ' + param.type);
                    responseUtils.responseError(res, 400, 'errCharacterWrongUnequip');
                    return;
                }
            }

            // Resto dinero
            usuario.game.tostolares -= equip.price;

            // equipo lo nuevo
            switch (params.type) {
                case 'weapon':
                    usuario.game.character.weapon.weapon = equip.id;
                    usuario.game.character.weapon.ammo = equip.ammo;
                    usuario.game.character.weapon.damage = equip.damage;
                    usuario.game.character.weapon.accuracy = equip.accuracy;
                    usuario.game.character.weapon.level = equip.level;
                    break;
                case 'skill':
                    usuario.game.character.skills.push({
                        skill: equip.id,
                        uses: equip.uses
                    });
                    usuario.game.character.skill_slots--;
                    break;
                case 'object':
                    usuario.game.character.objects.push({
                        object: equip.id,
                        uses: equip.uses
                    });
                    usuario.game.character.inventory_slots--;
                    break;
            }

            // Salvamos
            responseUtils.saveCharacterAndUserAndResponse(res, usuario, req.authInfo.access_token);
        });
    });

    //TODO upgrade weapon

    /**
     * POST /character/levelup
     * Sube de nivel
     * @params Body array: ids de talentos
     */
    characterRouter.post('/levelup', function (req, res, next) {
        // El objeto user
        var usuario = req.user,
            params = req.body;

        // Compruebo el estado de la partida, si es 1 ó 2. Si no, error
        if (usuario.game.gamedata.status !== config.GAME_STATUS.waiting) {
            console.tag('CHAR-LEVELUP').error('No se permite esta acción en el estado actual de la partida');
            responseUtils.responseError(res, 400, 'errGameStatusNotAllowed');
            return;
        }

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
                branch: null
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
            for (var id in nuevos) {
                if (nuevos.hasOwnProperty(id)) {
                    var newT = nuevos[id];

                    if (!sourceTalents[newT.id]) {
                        existen = false;
                    } else {
                        nuevos[newT.id].branch = sourceTalents[newT.id].branch;
                    }
                }
            }

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
            for (var id2 in nuevos) {
                if (nuevos.hasOwnProperty(id2)) {
                    var newT2 = nuevos[id2];
                    usuario.game.character.talents[newT2.branch].push(newT2.id);
                }
            }

            // Resta los puntos de talentos empleados
            usuario.game.character.talents.points -= params.talents.length;

            responseUtils.saveCharacterAndUserAndResponse(res, usuario, req.authInfo.access_token);
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
        if (!validator.matches(newName, config.REGEXP.str_valid_regexp) || !validator.isLength(newName, 3, 30)) {
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
