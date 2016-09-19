'use strict';

var SERVER = {
    // Contraseña por defecto de los usuarios
    default_password: '1234',
    censure_user: true //TODO activar en PRO
};


var REGEXP = {
    str_valid_regexp: /[a-zA-Z0-9ÑñáéíóúÁÉÍÓÚüÜ\-_ ]+/
};

/*************/

// Valores por defecto
var DEFAULTS = {
    toast_points: 10,
    reputation_to_tostolares_conversion: 100, // 100 de repu = 1 tostólar,

    // Personajes
    character: {
        stats_starting_value: 5,
        hire_cost: 1000 // Tostólares que cuesta
    }
};

// Tabla de estados de partida
var GAME_STATUS = {
    weekend: 0,// fin de semana. Se pone así cuando se crea una partida nueva.
    waiting: 1,// durante la semana, tiempo de espera entre juegos. Permite contratar. También meter y modificar tu pedido.
    battle: 2,// durante la semana, mientras se ejecutan los juegos. También meter y modificar tu pedido.
    resolution: 3,// una vez lanzado el desayuno, se muestran los resultados. No puedes hacer nada, ni modificar pedido, ni forja, habilidades...
    closed: 4// el viernes a las tantas se cierra la partida y se crea una nueva si era "recursiva"
};

// Tabla de ganancias de reputación
var REPUTATION = {
    // Reputación que se pierde al morir
    lost_dead: 100,
    // Reputación ganada por cada punto de acción al usar una habilidad
    win_toast_point: 10,
    // Reputación ganada por cada nivel de la habilidad usada
    win_skill_level: 10,
    // Reputación ganada por bloquear un ataque con éxito
    win_parry_success: 10
};

var CAUSE = {
    skill: 'skill',
    damage: 'damage',
    protection: 'protection'
};

//Exporto las funciones de la librería utils para que puedan accederse desde fuera
module.exports = {
    SERVER: SERVER,
    GAME_STATUS: GAME_STATUS,
    CAUSE: CAUSE,
    REPUTATION: REPUTATION,
    DEFAULTS: DEFAULTS,
    REGEXP: REGEXP
};

