'use strict';

module.exports = function (app) {
    var console = process.console;

    var express = require('express'),
        passport = require('passport'),
        events = require('events'),
        eventEmitter = new events.EventEmitter(),
        mongoRouter = express.Router(),
        mongoose = require('mongoose'),
        utils = require('../modules/utils'),
        models = require('../models/models')(mongoose),
        fakery = require('mongoose-fakery'),
        q = require('q');


    // Modelos
    var admins = [
        {username: "admin", password: "admin"}
    ];

    var ids = {};

    var meals = [
        {name: 'Plátano', ito: false},
        {name: 'Bocata', ito: true},
        {name: 'Salchicha', ito: true},
        {name: 'Tortilla con chorizo', ito: true},
        {name: 'Tortilla con cebolla', ito: true},
        {name: 'Pulga de pollo queso', ito: true},
        {name: 'Pulga de perro asado', ito: true},
        {name: 'Peperoni', ito: false}
    ];

    var drinks = [
        {name: 'Té con leche', ito: false},
        {name: 'Café con leche', ito: true},
        {name: 'Té americano', ito: true},
        {name: 'Zumo de pera', ito: true}
    ];

    var shop = [
        {
            key: 'shopItemBottle',
            price: 12,
            icon: 'air',
            amount: 2,
            action: 'item001',
            min_level: 0
        },
        {
            key: 'shopItemBottle2',
            price: 8,
            icon: 'burn',
            amount: 1,
            action: 'item002',
            min_level: 4
        }
    ];

    var skills = [
        {
            name: 'Ataque de pértiga',
            element: 'Salchichonio',
            source: 'weapon',
            uses: 3, duration: 2,
            cost: 3, action: 'a001',
            stats: {life: 5}
        },
        {
            name: 'Bola de patatas', element: 'fire', source: 'weapon',
            uses: 3, duration: 2,
            cost: 3, action: 'a002',
            stats: {protection: 5, parry: 7}
        },
        {
            name: 'Que te pego leche', element: 'Hielo', source: 'armor',
            uses: 3, duration: 2,
            cost: 3, action: 'a003',
            stats: {life: 5}
        },
        {
            name: 'Ataque elemental de fuego',
            element: 'fire',
            source: 'weapon',
            'class': 'bladed',
            level: 0, // Es el nivel del tostem
            target_number: 1,
            uses: null,
            duration: null,
            cost: 2,
            action: 'skillWeaponElementalAttack',
            stats: {
                precision_formula: 'round( basePrecision * (15 + (tostemLevel * 2)) / 100 )',
                damage_formula: 'round( baseDamage * (20 + (tostemLevel * 10)) / 100 )'
            }
        },
        {
            name: 'Ataque elemental de agua',
            element: 'water',
            source: 'weapon',
            'class': 'bladed',
            level: 0, // Es el nivel del tostem
            target_number: 1,
            uses: null,
            duration: null,
            cost: 2,
            action: 'skillWeaponElementalAttack',
            stats: {
                precision_formula: 'round( basePrecision * (15 + (tostemLevel * 2)) / 100 )',
                damage_formula: 'round( baseDamage * (20 + (tostemLevel * 10)) / 100 )'
            }
        },
        {
            name: 'Ataque elemental de tierra',
            element: 'earth',
            source: 'weapon',
            'class': 'bladed',
            level: 0, // Es el nivel del tostem
            target_number: 1,
            uses: null,
            duration: null,
            cost: 2,
            action: 'skillWeaponElementalAttack',
            stats: {
                precision_formula: 'round( basePrecision * (15 + (tostemLevel * 2)) / 100 )',
                damage_formula: 'round( baseDamage * (20 + (tostemLevel * 10)) / 100 )'
            }
        },
        {
            name: 'Ataque elemental de aire',
            element: 'air',
            source: 'weapon',
            'class': 'bladed',
            level: 0, // Es el nivel del tostem
            target_number: 1,
            uses: null,
            duration: null,
            cost: 2,
            action: 'skillWeaponElementalAttack',
            stats: {
                precision_formula: 'round( basePrecision * (15 + (tostemLevel * 2)) / 100 )',
                damage_formula: 'round( baseDamage * (20 + (tostemLevel * 10)) / 100 )'
            }
        },
        {
            name: 'Mira qué te meto', element: 'Moco', source: 'weapon',
            uses: 3, duration: 2,
            cost: 3, action: 'a005',
            stats: {damage: 5, fury: 10}
        },
        {
            name: 'Habilidad común', element: 'Patata', source: 'common',
            uses: 3, duration: 2,
            cost: 3, action: 'a006',
            stats: {damage: 5, fury: 10}
        }
    ];


    var date = new Date();
    var game = {
        repeat: true,
        status: 1,
        caller: null,
        players: null,
        notifications: [
            {
                message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
                type: 'fury',
                timestamp: date.getTime() + 10000
            }, {
                message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
                type: 'system',
                timestamp: date.getTime() + 1000
            }, {
                message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
                type: 'breakfast',
                timestamp: date.getTime() + 100
            }, {
                message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
                type: 'system',
                timestamp: date.getTime() + 10
            }
        ]
    };

    var users = [
        {
            username: 'pepe1',
            password: "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db", //1234
            alias: 'Antoñete',
            leader: true,
            avatar: 'http://findicons.com/files/icons/1072/face_avatars/300/j01.png',
            game: {
                gamedata: null,
                level: 2,
                tostolares: 1000,
                stats: {
                    life: 100,
                    fury: 76,
                    fury_mode: false,
                    reputation: 1520,
                    toast_points: 12
                },
                equipment: {
                    weapon: 'w001',
                    armor: null
                },
                inventory: {
                    tostems: [
                        {
                            id: 't001',
                            element: 'fire',
                            level: 2,
                            in_use: true
                        }, {
                            id: 't002',
                            element: 'water',
                            level: 3,
                            in_use: false
                        }, {
                            id: 't003',
                            element: 'earth',
                            level: 4,
                            in_use: false
                        }, {
                            id: 't004',
                            element: 'water',
                            level: 5,
                            in_use: false
                        }, {
                            id: 't005',
                            element: 'air',
                            level: 6,
                            in_use: false
                        }
                    ],
                    runes: [
                        {
                            id: 'r001',
                            material: 'madera',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r002',
                            material: 'madera',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }, {
                            id: 'r003',
                            material: 'madera',
                            frecuency: 'uncommon',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }, {
                            id: 'r004',
                            material: 'mithril',
                            frecuency: 'uncommon',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }
                    ],
                    weapons: [
                        {
                            id: 'w001',
                            name: 'Ten Hedor',
                            frecuency: 'common',
                            level: 2,
                            element: 'fire',
                            'class': 'bladed',
                            base_stats: {
                                damage: 14,
                                precision: 6
                            },
                            components: {
                                rune: 'r001',
                                tostem: 't001'
                            },
                            skills: [{
                                id: 's001',
                                name: 'Ataque elemental de fuego',
                                element: 'fire',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: true
                        }, {
                            id: 'w002',
                            name: 'Sal Chicha',
                            frecuency: 'legendary',
                            level: 2, base_stats: {
                                damage: 54,
                                precision: 64
                            },
                            components: {
                                rune: 'r002',
                                tostem: 't002'
                            },
                            skills: [{
                                id: 's003',
                                name: 'Ataque elemental de tierra',
                                element: 'earth',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: false
                        }
                    ],
                    armors: [{
                        id: 'a001',
                        name: 'Al Capa Ra',
                        frecuency: 'common',
                        element: 'earth',
                        'class': 'light',
                        level: 2, base_stats: {
                            protection: 4,
                            parry: 46
                        },
                        components: {
                            rune: 'r003',
                            tostem: 't003'
                        },
                        skills: [{
                            id: 's002',
                            name: 'Escudito in the back',
                            element: 'earth',
                            level: 2,
                            source: 'armor', // common, weapon, armor
                            uses: 3,
                            cost: 1,
                            stats: {
                                protection: 10,
                                parry: 5
                            },
                            blocked: false
                        }],
                        equipped: false
                    }],
                    stones: 23
                },
                afk: false,
                last_activity: date.getTime(),
                order: {
                    meal: null,
                    drink: null,
                    ito: true
                },
                last_order: {
                    meal: null,
                    drink: null,
                    ito: false
                },
                notifications: [{
                    message: 'nForgeWeapon#' + JSON.stringify({"name": "Arma de todos los tiempos"}),
                    type: 'forge',
                    timestamp: date.getTime() + 10500
                }, {
                    message: 'nEquipDestroyArmor#' + JSON.stringify({
                        "name": "Armadura caca",
                        "tostem": "fuego",
                        "tostemLvl": "3",
                        "rune": "cebolla",
                        "rune2": "alcachofa"
                    }),
                    type: 'equipment',
                    timestamp: date.getTime() + 1500
                }]
            }
        }, {
            username: 'pepe2',
            password: "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db", //paco
            alias: 'Manolin',
            leader: false,
            avatar: 'http://findicons.com/files/icons/1072/face_avatars/300/j01.png',
            game: {
                gamedata: null,
                level: 2,
                tostolares: 1000,
                stats: {
                    life: 100,
                    fury: 76,
                    fury_mode: false,
                    reputation: 23,
                    toast_points: 12
                },
                equipment: {
                    weapon: 'w001',
                    armor: 'a001'
                },
                inventory: {
                    tostems: [
                        {
                            id: 't001',
                            element: 'fire',
                            level: 2,
                            in_use: true
                        }, {
                            id: 't002',
                            element: 'water',
                            level: 3,
                            in_use: true
                        }, {
                            id: 't003',
                            element: 'earth',
                            level: 4,
                            in_use: true
                        }, {
                            id: 't004',
                            element: 'water',
                            level: 5,
                            in_use: false
                        }, {
                            id: 't005',
                            element: 'light',
                            level: 6,
                            in_use: false
                        }
                    ],
                    runes: [
                        {
                            id: 'r001',
                            material: 'wood',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r002',
                            material: 'iron',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r003',
                            material: 'steel',
                            frecuency: 'uncommon',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r004',
                            material: 'mithril',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }
                    ],
                    weapons: [
                        {
                            id: 'w001',
                            name: 'Ten Hedor',
                            frecuency: 'common',
                            level: 2,
                            element: 'fire',
                            'class': 'bladed',
                            base_stats: {
                                damage: 14,
                                precision: 6
                            },
                            components: {
                                rune: 'r001',
                                tostem: 't001'
                            },
                            skills: [{
                                id: 's001',
                                name: 'Ataque elemental de fuego',
                                element: 'fire',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: true
                        }, {
                            id: 'w002',
                            name: 'Sal Chicha',
                            frecuency: 'legendary',
                            level: 2, base_stats: {
                                damage: 54,
                                precision: 64
                            },
                            components: {
                                rune: 'r002',
                                tostem: 't002'
                            },
                            skills: [{
                                id: 's003',
                                name: 'Ataque elemental de tierra',
                                element: 'earth',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: false
                        }
                    ],
                    armors: [{
                        id: 'a001',
                        name: 'Al Capa Ra',
                        frecuency: 'common',
                        'class': 'medium',
                        element: 'earth',
                        level: 2, base_stats: {
                            protection: 4,
                            parry: 46
                        },
                        components: {
                            rune: 'r003',
                            tostem: 't003'
                        },
                        skills: [{
                            id: 's002',
                            name: 'Escudito in the back',
                            element: 'earth',
                            level: 2,
                            source: 'armor', // common, weapon, armor
                            uses: 3,
                            cost: 1,
                            stats: {
                                protection: 10,
                                parry: 5
                            },
                            blocked: false
                        }],
                        equipped: false
                    }],
                    stones: 23
                },
                afk: false,
                last_activity: date.getTime(),
                order: {
                    meal: null,
                    drink: null,
                    ito: true
                },
                last_order: {
                    meal: null,
                    drink: null,
                    ito: false
                }
            }
        }, {
            username: 'pepe3',
            password: "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db", //paco
            alias: 'Felisuco',
            leader: true,
            avatar: 'http://findicons.com/files/icons/1072/face_avatars/300/j01.png',
            game: {
                gamedata: null,
                level: 2,
                tostolares: 1000,
                stats: {
                    life: 100,
                    fury: 76,
                    fury_mode: false,
                    reputation: 23,
                    toast_points: 12
                },
                equipment: {
                    weapon: 'w001',
                    armor: 'a001'
                },
                inventory: {
                    tostems: [
                        {
                            id: 't001',
                            element: 'fire',
                            level: 2,
                            in_use: true
                        }, {
                            id: 't002',
                            element: 'water',
                            level: 3,
                            in_use: true
                        }, {
                            id: 't003',
                            element: 'earth',
                            level: 4,
                            in_use: true
                        }, {
                            id: 't004',
                            element: 'water',
                            level: 5,
                            in_use: false
                        }, {
                            id: 't005',
                            element: 'light',
                            level: 6,
                            in_use: false
                        }
                    ],
                    runes: [
                        {
                            id: 'r001',
                            material: 'wood',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r002',
                            material: 'iron',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r003',
                            material: 'steel',
                            frecuency: 'uncommon',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r004',
                            material: 'mithril',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }
                    ],
                    weapons: [
                        {
                            id: 'w001',
                            name: 'Ten Hedor',
                            frecuency: 'common',
                            level: 2,
                            element: 'fire',
                            'class': 'bladed',
                            base_stats: {
                                damage: 14,
                                precision: 6
                            },
                            components: {
                                rune: 'r001',
                                tostem: 't001'
                            },
                            skills: [{
                                id: 's001',
                                name: 'Ataque elemental de fuego',
                                element: 'fire',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: true
                        }, {
                            id: 'w002',
                            name: 'Sal Chicha',
                            frecuency: 'legendary',
                            level: 2, base_stats: {
                                damage: 54,
                                precision: 64
                            },
                            components: {
                                rune: 'r002',
                                tostem: 't002'
                            },
                            skills: [{
                                id: 's003',
                                name: 'Ataque elemental de tierra',
                                element: 'earth',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: false
                        }
                    ],
                    armors: [{
                        id: 'a001',
                        name: 'Al Capa Ra',
                        frecuency: 'common',
                        level: 2, base_stats: {
                            protection: 4,
                            parry: 46
                        },
                        components: {
                            rune: 'r003',
                            tostem: 't003'
                        },
                        skills: [{
                            id: 's002',
                            name: 'Escudito in the back',
                            element: 'earth',
                            level: 2,
                            source: 'armor', // common, weapon, armor
                            uses: 3,
                            cost: 1,
                            stats: {
                                protection: 10,
                                parry: 5
                            },
                            blocked: false
                        }],
                        equipped: false
                    }],
                    stones: 23
                },
                afk: false,
                last_activity: date.getTime(),
                order: {
                    meal: null,
                    drink: null,
                    ito: true
                },
                last_order: {
                    meal: null,
                    drink: null,
                    ito: false
                }
            }
        }, {
            username: 'pepe4',
            password: "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db", //paco
            alias: 'Jolines',
            leader: true,
            avatar: 'http://findicons.com/files/icons/1072/face_avatars/300/j01.png',
            game: {
                gamedata: null,
                level: 2,
                tostolares: 1000,
                stats: {
                    life: 100,
                    fury: 76,
                    fury_mode: false,
                    reputation: 23,
                    toast_points: 12
                },
                equipment: {
                    weapon: 'w001',
                    armor: 'a001'
                },
                inventory: {
                    tostems: [
                        {
                            id: 't001',
                            element: 'fire',
                            level: 2,
                            in_use: true
                        }, {
                            id: 't002',
                            element: 'water',
                            level: 3,
                            in_use: true
                        }, {
                            id: 't003',
                            element: 'earth',
                            level: 4,
                            in_use: true
                        }, {
                            id: 't004',
                            element: 'water',
                            level: 5,
                            in_use: false
                        }, {
                            id: 't005',
                            element: 'light',
                            level: 6,
                            in_use: false
                        }
                    ],
                    runes: [
                        {
                            id: 'r001',
                            material: 'wood',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r002',
                            material: 'iron',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r003',
                            material: 'steel',
                            frecuency: 'uncommon',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r004',
                            material: 'mithril',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }
                    ],
                    weapons: [
                        {
                            id: 'w001',
                            name: 'Ten Hedor',
                            frecuency: 'common',
                            level: 2,
                            element: 'fire',
                            'class': 'bladed',
                            base_stats: {
                                damage: 14,
                                precision: 6
                            },
                            components: {
                                rune: 'r001',
                                tostem: 't001'
                            },
                            skills: [{
                                id: 's001',
                                name: 'Ataque elemental de fuego',
                                element: 'fire',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: true
                        }, {
                            id: 'w002',
                            name: 'Sal Chicha',
                            frecuency: 'legendary',
                            level: 2, base_stats: {
                                damage: 54,
                                precision: 64
                            },
                            components: {
                                rune: 'r002',
                                tostem: 't002'
                            },
                            skills: [{
                                id: 's003',
                                name: 'Ataque elemental de tierra',
                                element: 'earth',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: false
                        }
                    ],
                    armors: [{
                        id: 'a001',
                        name: 'Al Capa Ra',
                        frecuency: 'common',
                        level: 2, base_stats: {
                            protection: 4,
                            parry: 46
                        },
                        components: {
                            rune: 'r003',
                            tostem: 't003'
                        },
                        skills: [{
                            id: 's002',
                            name: 'Escudito in the back',
                            element: 'earth',
                            level: 2,
                            source: 'armor', // common, weapon, armor
                            uses: 3,
                            cost: 1,
                            stats: {
                                protection: 10,
                                parry: 5
                            },
                            blocked: false
                        }],
                        equipped: false
                    }],
                    stones: 23
                },
                afk: false,
                last_activity: date.getTime(),
                order: {
                    meal: null,
                    drink: null,
                    ito: true
                },
                last_order: {
                    meal: null,
                    drink: null,
                    ito: false
                }
            }
        }, {
            username: 'pepe5',
            password: "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db", //paco
            alias: 'Si tu lo dices',
            leader: true,
            avatar: 'http://findicons.com/files/icons/1072/face_avatars/300/j01.png',
            game: {
                gamedata: null,
                level: 2,
                tostolares: 1000,
                stats: {
                    life: 100,
                    fury: 76,
                    fury_mode: false,
                    reputation: 23,
                    toast_points: 12
                },
                equipment: {
                    weapon: 'w001',
                    armor: 'a001'
                },
                inventory: {
                    tostems: [
                        {
                            id: 't001',
                            element: 'fire',
                            level: 2,
                            in_use: true
                        }, {
                            id: 't002',
                            element: 'water',
                            level: 2,
                            in_use: true
                        }, {
                            id: 't003',
                            element: 'earth',
                            level: 4,
                            in_use: true
                        }, {
                            id: 't004',
                            element: 'fire',
                            level: 5,
                            in_use: false
                        }, {
                            id: 't005',
                            element: 'light',
                            level: 6,
                            in_use: false
                        }
                    ],
                    runes: [
                        {
                            id: 'r001',
                            material: 'woody',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r002',
                            material: 'irony',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r003',
                            material: 'steely',
                            frecuency: 'uncommon',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: true
                        }, {
                            id: 'r004',
                            material: 'mithrily',
                            frecuency: 'common',
                            stats_percentages: {
                                damage: 12,
                                precision: 33,
                                protection: 56,
                                parry: 45
                            },
                            in_use: false
                        }
                    ],
                    weapons: [
                        {
                            id: 'w001',
                            name: 'Ten Hedor',
                            frecuency: 'common',
                            level: 2,
                            element: 'fire',
                            'class': 'bladed',
                            base_stats: {
                                damage: 14,
                                precision: 6
                            },
                            components: {
                                rune: 'r001',
                                tostem: 't001'
                            },
                            skills: [{
                                id: 's001',
                                name: 'Ataque elemental de fuego',
                                element: 'fire',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: true
                        }, {
                            id: 'w002',
                            name: 'Sal Chicha',
                            frecuency: 'legendary',
                            level: 2, base_stats: {
                                damage: 54,
                                precision: 64
                            },
                            components: {
                                rune: 'r002',
                                tostem: 't002'
                            },
                            skills: [{
                                id: 's003',
                                name: 'Ataque elemental de tierra',
                                element: 'earth',
                                source: 'weapon',
                                'class': 'bladed',
                                level: 1, // Es el nivel del tostem
                                target_number: 1,
                                uses: 3,
                                duration: null,
                                cost: 2,
                                action: 'skillWeaponElementalAttack',
                                stats: {
                                    damage: 20
                                },
                                blocked: false
                            }],
                            equipped: false
                        }
                    ],
                    armors: [{
                        id: 'a001',
                        name: 'Al Capa Ra',
                        frecuency: 'common',
                        level: 2, base_stats: {
                            protection: 4,
                            parry: 46
                        },
                        components: {
                            rune: 'r003',
                            tostem: 't003'
                        },
                        skills: [{
                            id: 's002',
                            name: 'Escudito in the back',
                            element: 'earth',
                            level: 2,
                            source: 'armor', // common, weapon, armor
                            uses: 3,
                            cost: 1,
                            stats: {
                                protection: 10,
                                parry: 5
                            },
                            blocked: false
                        }],
                        equipped: false
                    }],
                    stones: 23
                },
                afk: true,
                last_activity: date.getTime(),
                order: {
                    meal: null,
                    drink: null,
                    ito: true
                },
                last_order: {
                    meal: null,
                    drink: null,
                    ito: false
                }
            }
        }
    ];

    // ROUTER
    mongoRouter.get('/mongoOLD', function (req, res, next) {
        console.log('Inicio');
        models.Admin.remove({}, function (err) {
            //Meto los nuevos valores
            models.Admin.create(admins, function (err, admins) {
                eventEmitter.emit('#1', res);
            });
        });
    });

    //eventEmitter.setMaxListeners(20);
    //console.log('Listeners: ' + eventEmitter.getMaxListeners());

    //Eventos
    eventEmitter.on('#1', function (res) {
        console.log('#1');
        //Limpio la colección antes
        //models.Meal.remove({}, function (err) {
        mongoose.connection.collections['meals'].drop(function (err) {
            //Meto los nuevos valores
            models.Meal.create(meals, function (err, meals) {
                console.log("Emit #2");
                eventEmitter.emit('#2', {
                    res: res,
                    meals: meals
                });

            });
        });
    });

    eventEmitter.on('#2', function (data) {
        console.log('#2');
        //models.Drink.remove({}, function (err) {
        mongoose.connection.collections['drinks'].drop(function (err) {
            //Meto los nuevos valores
            models.Drink.create(drinks, function (err, drinks) {
                //res.json({"mongo": true, meals: meals});
                console.log("Emit #2.5");
                eventEmitter.emit('#2.5', {
                    res: data.res,
                    meals: data.meals,
                    drinks: drinks
                });

            });
        });
    });

    eventEmitter.on('#2.5', function (data) {
        console.log('#2.5');
        //models.Skill.remove({}, function (err) {
        mongoose.connection.collections['shops'].drop(function (err) {

            //Meto los nuevos valores
            models.Shop.create(shop, function (err, shop) {
                //res.json({"mongo": true, meals: meals});
                console.log("Emit #3");
                eventEmitter.emit('#3', {
                    res: data.res,
                    meals: data.meals,
                    drinks: data.drinks,
                    shop: shop
                });

            });
        });
    });

    eventEmitter.on('#3', function (data) {
        console.log('#3');
        //models.Skill.remove({}, function (err) {
        mongoose.connection.collections['skills'].drop(function (err) {

            //Meto los nuevos valores
            models.Skill.create(skills, function (err, skills) {
                //res.json({"mongo": true, meals: meals});
                eventEmitter.emit('#4', {
                    res: data.res,
                    meals: data.meals,
                    drinks: data.drinks,
                    shop: data.shop,
                    skills: skills
                });

            });
        });
    });

    eventEmitter.on('#4', function (data) {
        console.log('#4');
        //models.Game.remove({}, function (err) {

        mongoose.connection.collections['games'].drop(function (err) {
            console.log(err);
            //Meto los nuevos valores
            models.Game.create(game, function (err, game) {
                console.log(err);

                eventEmitter.emit('#5', {
                    res: data.res,
                    meals: data.meals,
                    drinks: data.drinks,
                    shop: data.shop,
                    skills: data.skills,
                    game: game
                });

            });
        });
    });

    eventEmitter.on('#5', function (data) {
        console.log('#5');
        //models.User.remove({}, function (err) {
        mongoose.connection.collections['users'].drop(function (err) {
            console.log(err);

            //Meto los nuevos valores
            models.User.create(users, function (err, users) {
                console.log(err);
                //res.json({"mongo": true, meals: meals});
                eventEmitter.emit('#6', {
                    res: data.res,
                    meals: data.meals,
                    drinks: data.drinks,
                    shop: data.shop,
                    skills: data.skills,
                    game: data.game,
                    users: users
                });

            });
        });
    });

    eventEmitter.on('#6', function (data) {
        console.log('#6');
        var arrPla = [];

        data.users.forEach(function (user) {
            console.log("IDS");
            console.log(user._id.toString());
            arrPla.push(user._id);
        });

        models.Game.update({}, {$set: {"players": arrPla}}, function (err) {
            console.log(err);
            console.log("UPDATED GAME");
            eventEmitter.emit('#7', data);
        });
    });

    eventEmitter.on('#7', function (data) {
        console.log('#7');
        models.User.update({}, {
            $set: {
                "game.gamedata": data.game._id,
                "game.order.meal": data.meals[utils.randomInt(0, 7)]._id,
                "game.order.drink": data.drinks[utils.randomInt(0, 3)]._id
            }
        }, {multi: true}, function (err) {
            console.log("UPDATED USERS");
            console.log(err);

            data.res.json({"mongo": true});
        });
    });


    /**
     * Para cambiar el estado de la partida
     */
    mongoRouter.get('/game/status/:status', function (req, res, next) {
        var estado = req.params.status;

        console.log("otro endpoint");

        models.Game.update({}, {
            $set: {
                "status": estado
            }
        }, {multi: true}, function (err) {
            console.log("UPDATED GAMES");
            console.log(err);

            res.json({"game": true});
        });
    });

    mongoRouter.get('/mongo', function (req, res, next) {
        console.log('Mongo router');

        var promises = [
            mongoose.connection.collections['character'].drop(),
            mongoose.connection.collections['drink'].drop(),
            mongoose.connection.collections['game'].drop(),
            mongoose.connection.collections['meal'].drop(),
            mongoose.connection.collections['object'].drop(),
            mongoose.connection.collections['place'].drop(),
            mongoose.connection.collections['skill'].drop(),
            mongoose.connection.collections['talent'].drop()
        ];

        // IDs
        ids['talent'] = [
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10)
        ];
        ids['skill'] = [
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10)
        ];
        ids['character'] = [
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10),
            fakery.g.hex(10, 10)
        ];

        q.all(promises).then(function (result) {
            eventEmitter.emit('#Characters');
            eventEmitter.emit('#MealDrink');
            eventEmitter.emit('#Characters');
        });
    });


    eventEmitter.on('#MealDrink', function (data) {
        console.log('#MealDrink');
        //Meto los nuevos valores
        models.Meal.create(meals, function (err, meals) {
            console.log("Emit #2");
            eventEmitter.emit('#2', {
                res: res,
                meals: meals
            });
        });

        //Meto los nuevos valores
        models.Drink.create(drinks, function (err, drinks) {
            //res.json({"mongo": true, meals: meals});
            console.log("Emit #2.5");
            eventEmitter.emit('#2.5', {
                res: data.res,
                meals: data.meals,
                drinks: drinks
            });
        });
    });

    eventEmitter.on('#Characters', function () {
        console.log('#Characters');
        fakery.fake('character', mongoose.model('Character'), {
            name: fakery.g.name(),
            level: fakery.g.rndint(1, 10),
            location: {
                place_id: fakery.g.hex(10, 10),
                sector: fakery.g.surname(),
                latitude: fakery.g.rndint(),
                longitude: fakery.g.rndint()
            },
            stats: {
                damage: fakery.g.rndint(),
                reduction: fakery.g.rndint(),
                life: fakery.g.rndint(),
                toxicity: fakery.g.rndint(),
                perception: fakery.g.rndint(),
                reflexes: fakery.g.rndint(),
                stealth: fakery.g.rndint(),
                hunger: fakery.g.rndint(),
                fatigue: fakery.g.rndint(),
                venom: fakery.g.rndint(),
                healing: fakery.g.rndint()
            },
            score: fakery.g.rndint(),
            talents: {
                points: fakery.g.rndint(),
                combat: [{
                    talent_id: String,
                    points: fakery.g.rndint()
                }],
                survival: [{
                    talent_id: String,
                    points: fakery.g.rndint()
                }],
                exploration: [{
                    talent_id: String,
                    points: fakery.g.rndint()
                }]
            },
            skill_slots: fakery.g.rndint(),
            skills: [{
                skill_id: String,
                uses: fakery.g.rndint()
            }],
            inventory_slots: fakery.g.rndint(),
            inventory: {
                object_id: String,
                uses: fakery.g.rndint()
            },
            weapon: {
                name: fakery.g.surname(),
                ammo: fakery.g.rndint(),
                damage: fakery.g.rndint(),
                accuracy: fakery.g.rndint(),
                level: fakery.g.rndint()
            }
        });

        fakery.makeAndSave('character', function (err, user) {
            // `user` is saved to the database and name is overriden to 'override'.
            console.log("FIN");
            console.log(user);
        });
        fakery.makeAndSave('character', function (err, user) {
            // `user` is saved to the database and name is overriden to 'override'.
            console.log("FIN");
            console.log(user);
        });
    });

    // Asigno los router a sus rutas
    app.use('/dev', mongoRouter);


}
;

//Use new Aggregate({ $match: { _id: mongoose.Schema.Types.ObjectId('00000000000000000000000a') } }); instead.
