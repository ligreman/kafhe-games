'use strict';

var config = require('../modules/config'),
    console = process.console,
    math = require('mathjs');


/**
 * Se encarga de censurar aquéllos datos que no quiero devolver al frontend porque no los necesita. En concreto:
 * - Valor de reputación. No lo voy a usar en el front.
 * - Valores de las runas del inventario (damage, precision, protection, parry
 * - Valores base de armas y armaduras
 * - Valores de las skills dentro de las armas y armaduras
 * @param user Objeto usuario a censurar
 * @returns {*}
 */
var censureUser = function (user) {
    if (!config.SERVER.censure_user) {
        return user;
    }

    return user;

    // Censuro la reputación
    // user.game.stats.reputation = null;

    /*// Cambio de valores de las runas en el inventario
     user.game.inventory.runes.forEach(function (runa) {
     runa.stats_percentages.damage = valueToStars(runa.stats_percentages.damage, 25, 150);
     runa.stats_percentages.precision = valueToStars(runa.stats_percentages.precision, 25, 150);
     runa.stats_percentages.protection = valueToStars(runa.stats_percentages.protection, 25, 150);
     runa.stats_percentages.parry = valueToStars(runa.stats_percentages.parry, 25, 150);
     });

     // Las habilidades de armas
     user.game.inventory.weapons.forEach(function (weapon) {
     // Cambio las base stats
     weapon.base_stats.damage = valueToStars(weapon.base_stats.damage, 25, 100);
     weapon.base_stats.precision = valueToStars(weapon.base_stats.precision, 25, 100);

     // Ahora miro las skills del arma
     weapon.skills.forEach(function (skill) {
     skill.stats.life = valueToStars(skill.stats.life, 0, 100);
     skill.stats.fury = valueToStars(skill.stats.fury, 0, 1000);
     skill.stats.damage = valueToStars(skill.stats.damage, 0, 200);
     skill.stats.damage_formula = null;
     skill.stats.precision = valueToStars(skill.stats.precision, 1, 25, 200);
     skill.stats.precision_formula = null;
     skill.stats.protection = valueToStars(skill.stats.protection, 0, 100);
     skill.stats.protection_formula = null;
     skill.stats.parry = valueToStars(skill.stats.parry, 0, 100);
     skill.stats.parry_formula = null;
     });
     });

     // Las habilidades de armadura
     user.game.inventory.armors.forEach(function (armor) {
     // Cambio las base stats
     armor.base_stats.protection = valueToStars(armor.base_stats.protection, 10, 100);
     armor.base_stats.parry = valueToStars(armor.base_stats.parry, 15, 100);

     // Ahora miro las skills del arma
     armor.skills.forEach(function (skill) {
     skill.stats.life = valueToStars(skill.stats.life, 0, 100);
     skill.stats.fury = valueToStars(skill.stats.fury, 0, 1000);
     skill.stats.damage = valueToStars(skill.stats.damage, 0, 200);
     skill.stats.damage_formula = null;
     skill.stats.precision = valueToStars(skill.stats.precision, 1, 25, 200);
     skill.stats.precision_formula = null;
     skill.stats.protection = valueToStars(skill.stats.protection, 0, 100);
     skill.stats.protection_formula = null;
     skill.stats.parry = valueToStars(skill.stats.parry, 0, 100);
     skill.stats.parry_formula = null;
     });
     });

     return user;*/
};

var processUser = function (user) {

    // Si tiene personaje, calculo sus stats
    if (user.game.character) {
        var combatLevel = user.game.character.talents.combat.length * config.DEFAULTS.character.stats_starting_value,
            explorationLevel = user.game.character.talents.exploration.length * config.DEFAULTS.character.stats_starting_value,
            survivalLevel = user.game.character.talents.survival.length * config.DEFAULTS.character.stats_starting_value;

        // Calculo sus stats
        user.game.character.stats = {
            damage: 0,
            reduction: combatLevel,
            life: survivalLevel,
            perception: explorationLevel,
            reflexes: combatLevel,
            stealth: math.median(combatLevel * explorationLevel),
            hunger: explorationLevel,
            fatigue: math.median(combatLevel * survivalLevel),
            venom: math.median(survivalLevel * explorationLevel),
            healing: survivalLevel
        };
    }

    return user;
};

/**
 * Cambia un valor a estrellas de 1 a 10
 * @param value Valor a convertir
 * @param minValue Mínimo valor que puede alcanzar value
 * @param maxValue Máximo valor que puede alcanzar value
 */
function valueToStars(value, minValue, maxValue) {
    if (!value) {
        return null;
    }
    maxValue -= minValue;

    return Math.floor(value * 10 / maxValue);
}

/**
 * Respuesta estándar del servicio
 * @param data Objeto con los datos a devolver
 * @param access_token Token
 * @param res Objeto respuesta
 */
function responseJson(res, data, access_token) {
    // Guardo el usuario
    res.json({
        "data": data,
        "session": {
            "access_token": access_token,
            "expire": 1000 * 60 * 60 * 24 * 30
        },
        "error": ""
    });
}

/**
 * Guarda el usuario y responde con los datos del mismo
 * @param res Objeto respuesta
 * @param user Objeto con los datos a devolver
 * @param access_token Token
 */
function saveUserAndResponse(res, user, access_token) {
    user.save(function (err) {
        if (err) {
            console.tag('MONGO').error(err);
            // console.error(err);
            responseError(res, 400, 'errMongoSave');
        } else {
            // Respondo
            responseJson(res, {"user": censureUser(user)}, access_token);
        }
    });
}

/**
 * Guarda el personaje, usuario y responde con los datos del mismo
 * @param res Objeto respuesta
 * @param user Objeto con los datos a devolver
 * @param access_token Token
 */
function saveCharacterAndUserAndResponse(res, user, access_token) {
    user.game.character.save(function (err) {
        if (err) {
            console.tag('MONGO').error(err);
            responseError(res, 400, 'errMongoSave');
        } else {
            // Salvo al usuario
            saveUserAndResponse(res, user, access_token);
        }
    });
}

/**
 * Devuelve un error en JSON
 * @param res
 * @param code
 * @param errCode
 */
var responseError = function (res, code, errCode) {
    var response = {};

    switch (code) {
        case 401:
        case 403:
            response = {
                "login": false,
                "error": errCode
            };
            break;
        case 400:
        case 500:
            response = {
                "error": errCode
            };
            break;
    }

    console.error(code + ' ' + errCode);

    res.status(code).json(response);
};

//Exporto las funciones de la librería
module.exports = {
    censureUser: censureUser,
    processUser: processUser,
    valueToStars: valueToStars,
    responseJson: responseJson,
    saveUserAndResponse: saveUserAndResponse,
    saveCharacterAndUserAndResponse: saveCharacterAndUserAndResponse,
    responseError: responseError
};

