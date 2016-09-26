'use strict';

var console = process.console,
    TAFFY = require('taffy'),
    Q = require('q'),
    math = require('mathjs'),
    utils = require('./utils'),
    config = require('./config'),
    formulas = require('./formulas');

/**
 * Elimina el equipo (objeto o habilidades) del usuario
 */
var unequip = function (user, unequip, type) {
    // Compruebo que vienen los parámetros
    if (!user || !unequip) {
        return false;
    }

    switch (type) {
        case 'skill':
            user.game.character.skills.forEach(function (thisSkill, index) {
                if (thisSkill.skill === unequip.id) {
                    user.game.character.skills.splice(index, 1);
                    user.game.character.skill_slots++;
                }
            });
            break;
        case 'object':
            user.game.character.inventory.forEach(function (thisObject, index) {
                if (thisObject.object === unequip.id) {
                    user.game.character.inventory_slots.splice(index, 1);
                    user.game.character.inventory_slots++;
                }
            });
            break;
    }

    return user;
};

//Exporto las funciones de la librería
module.exports = {
    unequip: unequip
};

