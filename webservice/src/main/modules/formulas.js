'use strict';

/**
 * Calculo de la reputación según el daño hecho
 * @params levelDifference (!=0), damage
 */
var reputationDamage = 'round( sign(levelDifference) * round(100 * damage * max(1,(levelDifference/3)) / 3500) )';

/**
 * Calcula la reputación del daño prevenido por la armadura
 * @params levelDifference (!=0), damagePrevented
 */
var reputationDamagePrevented = 'round(damagePrevented / 5) + max(round(levelDifference/3), 0)';

//Exporto las funciones de la librería utils para que puedan accederse desde fuera
module.exports = {
    FORMULA_REPUTATION_DAMAGE: reputationDamage,
    FORMULA_REPUTATION_DAMAGE_PREVENTED: reputationDamagePrevented
};

