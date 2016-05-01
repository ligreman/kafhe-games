'use strict';

// Contraseña por defecto de los usuarios
var DEFAULT_PASSWORD = '1234';
// TODO activar en PRO
var CENSURE_USER = true;


var CONSTANTS = {
    TEAM_MAX_MERCS: 5
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
    // fin de semana. Se pone así cuando se crea una partida nueva.
    WEEKEND: 0,
    // durante la semana. Puedes ejecutar habilidades, usar el horno y la forja, equiparte, destruir equipo... También meter y modificar tu pedido.
    BATTLE: 1,
    // el viernes a las 00:00 hasta que se lanza el desayuno. Puedes comprar cosas y modificar tu pedido. Ya no puedes hacer lo de habilidades, forja...
    BUSINESS: 2,
    // una vez lanzado el desayuno, se muestran los resultados. No puedes hacer nada, ni modificar pedido, ni forja, habilidades...
    RESOLUTION: 3,
    // el viernes a las tantas se cierra la partida y se crea una nueva si era "recursiva"
    CLOSED: 4
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

