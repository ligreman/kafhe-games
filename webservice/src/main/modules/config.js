'use strict';

// Contraseña por defecto de los usuarios
var DEFAULT_PASSWORD = '1234';
// TODO activar en PRO
var CENSURE_USER = true;


var CONSTANTS = {
    STR_VALID_REGEXP: /[a-zA-Z0-9ÑñáéíóúÁÉÍÓÚüÜ\-_ ]+/,
    MERC_TEAM_MAX: 5,
    MERC_STARTING_STAT_VALUE: 5,
    MERC_HIRE_COST: 1000
};

/*************/


var FURY = {
    // Mínima cantidad de puntos para activar el modo furia. Cada estos puntos es una barra de furia
    FURY_MODE_ACTIVATE_MIN_POINTS: 1000,
    // Cuanto consume un ataque de furia
    FURY_MODE_USE_POINTS: 500,
    // Multiplicador del modo furia
    FURY_MODE_MULTIPLIER: 2
};

// Daño que recibes si no tienes armadura, en %
var DAMAGE_NO_ARMOR = 120;

// Valores por defecto
var DEFAULTS = {
    // Vida máxima
    MAX_LIFE: 1000,
    TOAST_POINTS: 10,
    REPUTATION_TO_TOSTOLARES_CONVERSION: 100 // 100 de repu = 1 tostólar
};

// Tabla de estados de partida
var GAME_STATUS = {
    WEEKEND: 0,// fin de semana. Se pone así cuando se crea una partida nueva.
    WAITING: 1,// durante la semana, tiempo de espera entre juegos. Permite contratar. También meter y modificar tu pedido.
    BATTLE: 2,// durante la semana, mientras se ejecutan los juegos. También meter y modificar tu pedido.
    RESOLUTION: 3,// una vez lanzado el desayuno, se muestran los resultados. No puedes hacer nada, ni modificar pedido, ni forja, habilidades...
    CLOSED: 4// el viernes a las tantas se cierra la partida y se crea una nueva si era "recursiva"
};

// Tabla de ganancias de reputación
var REPUTATION = {
    // Reputación que se pierde al morir
    LOST_DEAD: 100,
    // Reputación ganada por cada punto de acción al usar una habilidad
    WIN_TOAST_POINT: 10,
    // Reputación ganada por cada nivel de la habilidad usada
    WIN_SKILL_LEVEL: 10,
    // Reputación ganada por bloquear un ataque con éxito
    WIN_PARRY_SUCCESS: 10
};

var CAUSE = {
    skill: 'skill',
    damage: 'damage',
    protection: 'protection'
};

//Exporto las funciones de la librería utils para que puedan accederse desde fuera
module.exports = {
    DEFAULT_PASSWORD: DEFAULT_PASSWORD,
    CENSURE_USER: CENSURE_USER,
    GAME_STATUS: GAME_STATUS,
    CAUSE: CAUSE,
    DAMAGE_NO_ARMOR: DAMAGE_NO_ARMOR,
    REPUTATION: REPUTATION,
    FURY: FURY,
    DEFAULTS: DEFAULTS,
    CONSTANTS: CONSTANTS
};

