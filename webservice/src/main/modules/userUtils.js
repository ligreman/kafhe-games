'use strict';

var console = process.console,
    TAFFY = require('taffy'),
    Q = require('q'),
    math = require('mathjs'),
    utils = require('./utils'),
    config = require('./config'),
    formulas = require('./formulas');
// gameResources = require('./gameResources');


/**
 * Busca un arma en el inventario dada su ID
 * @param user Objeto usuario
 * @param idWeapon ID del arma
 * @returns {*} si no encuentra nada o no tiene nada equipado devuelve false, el objeto weapon si lo encuentra
 */
var getWeapon = function (user, idWeapon) {
    var weapons = TAFFY(user.game.inventory.weapons);
    var weapon = weapons({id: idWeapon}).get();

    if (weapon.length === 1) {
        return weapon[0];
    } else {
        return false;
    }
};

/**
 * Arma equipada
 * @param user El objeto usuario
 * @returns {*} si no encuentra nada o no tiene nada equipado devuelve false, el objeto weapon si lo encuentra
 */
var getEquippedWeapon = function (user) {
    if (!user.game.equipment.weapon) {
        return false;
    }

    return getWeapon(user, user.game.equipment.weapon);
};

/**
 * Busca una armadura en el inventario dada su ID
 * @param user Objeto usuario
 * @param idArmor ID del armadura
 * @returns {*} si no encuentra nada o no tiene nada equipado devuelve false, el objeto armor si lo encuentra
 */
var getArmor = function (user, idArmor) {
    var armors = TAFFY(user.game.inventory.armors);
    var armor = armors({id: idArmor}).get();

    if (armor.length === 1) {
        return armor[0];
    } else {
        return false;
    }
};


/**
 * Armadura equipada
 * @param user El objeto usuario
 * @returns {*} si no encuentra nada o no tiene nada equipado, el objeto armor si lo encuentra
 */
var getEquippedArmor = function (user) {
    if (!user.game.equipment.armor) {
        return false;
    }

    return getArmor(user, user.game.equipment.armor);
};

/**
 * Busca si el usuario tiene una habilidad concreta
 * @param user Objeto usuario
 * @param idSkill ID de la habilidad a buscar
 * @returns {*} False si no la encuentra, o el objeto Skill en caso de encontrarla
 */
var hasSkill = function (user, idSkill) {
    // Saco el arma y armadura equipadas
    var weaponEquipped = getEquippedWeapon(user);
    var armorEquipped = getEquippedArmor(user);
    var skills = [];

    // Skills del arma
    if (weaponEquipped) {
        skills = skills.concat(weaponEquipped.skills);
    }

    // Skills de la armadura
    if (armorEquipped) {
        skills = skills.concat(armorEquipped.skills);
    }

    if (skills.length === 0) {
        return false;
    }

    // Busco la skill en esta lista
    skills = TAFFY(skills);
    var skill = skills({id: idSkill}).get();

    if (skill.length === 1) {
        return skill[0];
    } else {
        return false;
    }
};

/**
 * Obtiene la lista de habilidades del inventario del usuario según equipo
 * @param user Objeto usuario
 * @param slot Hueco del inventario (weapons, armors)
 */
var getSkills = function (user, slot) {
    var objetos = user.game.inventory[slot];
    var skillList = [];

    objetos.forEach(function (objeto) {
        skillList = skillList.concat(objeto.skills);
    });

    return skillList;
};

/**
 * Actualiza una habilidad dentro de la estructura del User
 * @param user Objeto usuario
 * @param idSkill ID skill a actualizar
 * @param source Fuente de la skill: weapon o armor
 * @param changes Objeto con la actualización: {uses: 5}
 * @returns {*}
 */
var updateSkill = function (user, idSkill, source, changes) {
    // Pongo en plurar, para consultar el inventario
    if (source === 'weapon') {
        source = 'weapons';
    }
    if (source === 'armor') {
        source = 'armors';
    }

    var skills = getSkills(user, source),
        newSkills = [];

    // Actualizo el listado de skills
    skills.forEach(function (esta) {
        if (esta.id === idSkill) {
            for (var field in changes) {
                esta[field] = changes[field];
            }
        }
        newSkills.push(esta);
    });

    user.game.inventory[source].skills = newSkills;

    return user;
};

/**
 * Calcula el resultado de un ataque con habilidad
 * @param skillUsed Objeto habilidad usada por el atacante
 * @param target Objeto user del defensor
 * @param furyMode Modo furia del atacante activo?
 * @returns {object} Objeto con { damage: Daño en número que recibe el defensor, protection: daño evitado por la protección}
 */
var combatResult = function (skillUsed, target, furyMode) {
    var damage = 0, protection = 0;

    // Saco armadura del defensor
    var armorDef = getEquippedArmor(target);

    // Valor base de daño con precisión aplicada
    damage = Math.round(skillUsed.stats.damage * (skillUsed.stats.precision + 100) / 100);

    // Calculo variación de daño por enfrentamiento de elementos
    if (armorDef) {
        var elemPercent = gameResources.ELEMENT_DAMAGE[skillUsed.element][armorDef.element];
        damage = Math.round(damage * elemPercent / 100);
    }

    // Calculo variación de daño por enfrentamiento de tipos
    var typePercent = config.DAMAGE_NO_ARMOR; // por defecto
    if (armorDef) {
        typePercent = gameResources.WEAPON_DAMAGE[skillUsed.class][armorDef.class];
    }
    damage = Math.round(damage * typePercent / 100);

    // Modo furia. Si está activo hace el doble de daño
    if (furyMode) {
        damage = damage * config.FURY.FURY_MODE_MULTIPLIER;
    }

    // Calculo si el defensor bloquea y en ese caso miro la protección
    if (armorDef && utils.dice100(100 - armorDef.base_stats.parry)) {
        protection = armorDef.base_stats.protection;
    }

    // Daño base final, mínimo de 0
    damage = Math.max(damage - protection, 0);

    return {
        damage: damage,
        protection: protection
    };
};

/**
 * Promise para salvar el usuario
 * @param user
 * @returns {*}
 */
var saveUser = function (user) {
    var defer = Q.defer();

    user.save(function (err) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(user);
        }
    });

    return defer.promise;
};

/**
 * Hace daño al jugador
 * @param user Objeto usuario
 * @param damage Daño que recibe
 * @returns {{user: *, hasDied: boolean, reputationLost}}
 */
var takeDamage = function (user, damage) {
    var muere = false, muertes = 0;
    user.game.stats.life -= damage;

    // ¿Muere más veces?
    while (user.game.stats.life <= 0) {
        // user.game.stats.life = user.game.stats.life + config.DEFAULTS.MAX_LIFE;

        // Le quito reputación
        user.game.stats.reputation -= config.REPUTATION_LOST_DEAD;

        muere = true;
        muertes++;
    }

    return {
        user: user,
        hasDied: muere,
        reputationLost: muertes * config.REPUTATION_LOST_DEAD
    };
};

/**
 * Añade reputación al usuario dependiendo de qué lo haya causado
 * @param user Objeto usuario
 * @param sourceAmount Cantidad de causa que ha provocado el ganar reputación (daño, daño prevenido,action points ...)
 * @param levelDifference La diferencia de niveles devuelta por la función del mismo nombre, o nivel habilidad
 * @param causa 'damage', 'protection', 'skill'
 * @returns {*}
 */
var addReputation = function (user, sourceAmount, levelDifference, causa) {
    var ganancia = 0;

    switch (causa) {
        case config.CAUSE.skill:
            // Sumo un fijo por usar la habilidad, por cada punto de acción. Vienen en sourceAmount los ptos de acción
            ganancia += config.REPUTATION.win_toast_point * sourceAmount;

            // Por nivel de la habilidad. Viene en levelDifference el nivel de skill
            ganancia += config.REPUTATION.win_skill_level * levelDifference;
            break;
        case config.CAUSE.damage:
            // La diferencia de nivel si es 0, le pongo -1 para evitar divisiones por 0 y resultados 0
            if (levelDifference === 0) {
                // -1 porque quiero de resultado 1 a favor, y luego se multiplica por -1
                levelDifference = -1;
            }

            ganancia = math.eval(
                formulas.FORMULA_REPUTATION_DAMAGE,
                {
                    damage: sourceAmount,
                    levelDifference: -1 * levelDifference // Le cambio de signo porque tengo atk>def: positivo, y quiero lo contrario
                });
            break;
        case config.CAUSE.protection:
            // La diferencia de nivel si es 0, le pongo 1 para evitar divisiones por 0 y resultados 0
            if (levelDifference === 0) {
                levelDifference = 1;
            }

            // Gano un punto de reputación por cada 5 de daño prevenidos
            ganancia = math.eval(
                formulas.FORMULA_REPUTATION_DAMAGE_PREVENTED,
                {
                    damagePrevented: sourceAmount,
                    levelDifference: levelDifference // Aquí quiero que sea positivo si el defensor está en desventaja
                }
            );

            // Gano puntos fijos por haber bloqueado un ataque con éxito
            ganancia += config.REPUTATION.win_parry_success;

            break;
    }

    // Sumo o resto lo ganado
    user.game.stats.reputation += ganancia;

    return {
        user: user,
        reputation: ganancia
    };
};

/**
 * Devuelve el cálculo de diferencia de niveles entre el arma del atacante y la armadura del defensor
 * @param attacker
 * @param defender
 * @returns {number} Positivo si attacker > defender
 */
var levelDifference = function (attacker, defender) {
    // Saco el arma del user y la armadura de target
    var arma = getEquippedWeapon(attacker);
    var armadura = getEquippedArmor(defender);

    // Comprobaciones por si hay arma o armadura
    if (!arma) {
        arma = {level: 0}
    }
    if (!armadura) {
        armadura = {level: 0}
    }

    return arma.level - armadura.level;
};

/**
 * Actualizo la furia del usuario
 * @param user Objeto usuario
 * @param amount Cantidad de furia que se ha usado
 * @returns {{user: *, furyDisabled: boolean}}
 */
var updateFury = function (user, amount) {
    var furyDisabled = false;
    user.game.stats.fury -= amount;

    // Si no queda furia suficiente para hacer otro ataque, desactivo el modo furia
    if (user.game.stats.fury < config.FURY.FURY_MODE_USE_POINTS) {
        user.game.stats.fury_mode = false;
    }

    return {
        user: user,
        furyDisabled: furyDisabled
    };
};

//Exporto las funciones de la librería
module.exports = {
    getWeapon: getWeapon,
    getArmor: getArmor,
    getEquippedWeapon: getEquippedWeapon,
    getEquippedArmor: getEquippedArmor,
    hasSkill: hasSkill,
    updateSkill: updateSkill,
    combatResult: combatResult,
    saveUser: saveUser,
    takeDamage: takeDamage,
    addReputation: addReputation,
    levelDifference: levelDifference,
    updateFury: updateFury
};

