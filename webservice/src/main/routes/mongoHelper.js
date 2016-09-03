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

    var finalizado = 0;

    // Modelos
    var admins = [
        {username: "admin", password: "admin"}
    ];

    var meals = [
        {name: 'Plátano', ito: false, id: 'meal00'},
        {name: 'Bocata', ito: true, id: 'meal01'},
        {name: 'Salchicha', ito: true, id: 'meal02'},
        {name: 'Tortilla con chorizo', ito: true, id: 'meal03'},
        {name: 'Tortilla con cebolla', ito: true, id: 'meal04'},
        {name: 'Pulga de pollo queso', ito: true, id: 'meal05'},
        {name: 'Pulga de perro asado', ito: true, id: 'meal06'},
        {name: 'Peperoni', ito: false, id: 'meal07'}
    ];

    var drinks = [
        {name: 'Té con leche', ito: false, id: 'drink00'},
        {name: 'Café con leche', ito: true, id: 'drink01'},
        {name: 'Té americano', ito: true, id: 'drink02'},
        {name: 'Zumo de pera', ito: true, id: 'drink03'}
    ];

    var skills = [
        {
            name: 'Ataque de pértiga', description: 'Salchichonio 86',
            action: 'skill01', uses: 1, id: 'skill0'
        },
        {
            name: 'Que te pego leche', description: 'Un salchipapa in the face',
            action: 'skill02', uses: 2, id: 'skill1'
        },
        {
            name: 'Ataque elemental de fuego', description: 'Fogonazo',
            action: 'skill03', uses: 3, id: 'skill2'
        }
    ];

    var talents = [
        {
            id: 'talent00', name: 'Talento 0', description: 'Er talento 0',
            branch: 'combat', skills: ['skill01'], required: []
        },
        {
            id: 'talent01', name: 'Talento 1', description: 'Er talento 1',
            branch: 'exploration', skills: [], required: []
        },
        {
            id: 'talent02', name: 'Talento 2', description: 'Er talento 2',
            branch: 'exploration', skills: ['skill02'], required: ['talent01']
        },
        {
            id: 'talent03', name: 'Talento 3', description: 'Er talento 3',
            branch: 'exploration', skills: ['skill03'], required: ['talent01', 'talent02']
        }
    ];

    var places = [
        {
            id: 'place00', name: 'Un lugar de la mancha', description: 'De cuyo nombre no quiero acordarme',
            latitude: 34.00, longitude: -6.00, sector: 'swamp', type: 'surface', category: 'camp', level: 1
        },
        {
            id: 'place01', name: 'Dos lugar de la mancha', description: 'De cuyo nombre no quiero acordarme 2',
            latitude: 38.00, longitude: -16.00, sector: 'desert', type: 'dungeon', category: 'building', level: 2
        }
    ];
    var objects = [
        {id: 'object00', name: 'Objeto 0', description: 'El objeto 0', uses: 3},
        {id: 'object01', name: 'Objeto 1', description: 'El objeto 1', uses: 4},
        {id: 'object02', name: 'Objeto 2', description: 'El objeto 2', uses: 2}
    ];

    var date = new Date();
    var userId = new mongoose.Types.ObjectId;

    var game = [{
        _id: new mongoose.Types.ObjectId,
        repeat: true,
        status: 1,
        caller: null,
        players: [userId]
        /*notifications: [{
         message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
         type: 'fury', timestamp: date.getTime() + 10000
         }, {
         message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
         type: 'system', timestamp: date.getTime() + 1000
         }, {
         message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
         type: 'breakfast', timestamp: date.getTime() + 100
         }, {
         message: 'nFuryModeGame#' + JSON.stringify({"name": "Pepito"}),
         type: 'system', timestamp: date.getTime() + 10
         }
         ]*/
    }];

    var characters = [
        {
            _id: new mongoose.Types.ObjectId,
            name: 'Cara 1', level: 1,
            location: {place: 'place00', level: 0},
            stats: {
                damage: 10, reduction: 20, life: 30, toxicity: 15, perception: 16,
                reflexes: 17, stealth: 18, hunger: 19, fatigue: 21, venom: 22, healing: 25
            },
            score: 100,
            talents: {
                points: 5,
                combat: [{talent: 'talent00', level: 2}],
                survival: [],
                exploration: [{talent: 'talent01', points: 1}]
            },
            log: [{text: 'Texto de log', 'type': 'combat', subtype: null, date: date.getTime()}],
            skill_slots: 2,
            skills: [{skill: 'skill01', uses: 3}],
            inventory_slots: 3,
            inventory: {object: 'object01', uses: 2},
            weapon: {name: 'Armacita', ammo: 10, damage: 20, accuracy: 30, level: 1}
        }
    ];

    var users = [
        {
            _id: userId,
            username: 'pepe1',
            password: "d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db", //1234
            alias: 'Antoñete', leader: true, times: 2, calls: 50, group: 1,
            avatar: 'http://findicons.com/files/icons/1072/face_avatars/300/j01.png',
            game: {
                gamedata: game[0]._id, //{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}
                character: characters[0]._id, //{type: mongoose.Schema.Types.ObjectId, ref: 'Character'}
                rank: 2, tostolares: 1000, fame: 100, afk: false, last_activity: date.getTime(),
                warehouse: [],
                order: {meal: null, drink: null, ito: true},
                last_order: {meal: null, drink: null, ito: false},
                notifications: [
                    {
                        message: 'nForgeWeapon#' + JSON.stringify({"name": "Arma de todos los tiempos"}),
                        type: 'forge', timestamp: date.getTime() + 10500
                    }, {
                        message: 'nEquipDestroyArmor#' + JSON.stringify({"name": "Armadura caca", "tostem": "fuego"}),
                        type: 'equipment', timestamp: date.getTime() + 1500
                    }
                ]
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
        console.log('Inicio de restauración');
        var promises = [
            models.Admin.remove(),
            models.Character.remove(),
            models.Drink.remove(),
            models.Game.remove(),
            models.Meal.remove(),
            models.Object.remove(),
            models.Place.remove(),
            models.Session.remove(),
            models.Skill.remove(),
            models.Talent.remove(),
            models.User.remove()
        ];
        /*
         if (mongoose.connection.collections['character'])
         promises.push(mongoose.connection.collections['character'].drop());
         if (mongoose.connection.collections['drink'])
         promises.push(mongoose.connection.collections['drink'].drop());
         if (mongoose.connection.collections['game'])
         promises.push(mongoose.connection.collections['game'].drop());
         if (mongoose.connection.collections['meal'])
         promises.push(mongoose.connection.collections['meal'].drop());
         if (mongoose.connection.collections['object'])
         promises.push(mongoose.connection.collections['object'].drop());
         if (mongoose.connection.collections['place'])
         promises.push(mongoose.connection.collections['place'].drop());
         if (mongoose.connection.collections['skill'])
         promises.push(mongoose.connection.collections['skill'].drop());
         if (mongoose.connection.collections['talent'])
         promises.push(mongoose.connection.collections['talent'].drop());*/

        q.all(promises).then(function (result) {
            console.log("Base de datos limpiada");
            finalizado = 0;
            eventEmitter.emit('#CargaDatos', res);
        });
    });


    eventEmitter.on('#CargaDatos', function (res) {
        console.log('Cargando datos...');

        //Meto los nuevos valores
        models.Meal.create(meals, function (err, meals) {
            console.log("    Creadas las comidas");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Drink.create(drinks, function (err, drinks) {
            console.log("    Creadas las bebidas");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Skill.create(skills, function (err, skills) {
            console.log("    Creadas las habilidades");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Talent.create(talents, function (err, talents) {
            console.log("    Creados los talentos");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Place.create(places, function (err, places) {
            console.log("    Creados los lugares");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Object.create(objects, function (err, objects) {
            console.log("    Creados los objetos");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Game.create(game, function (err, games) {
            console.log("    Creado el juego");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.Character.create(characters, function (err, chars) {
            console.log("    Creados los characters");
            eventEmitter.emit('#Finalizado', res);
        });

        //Meto los nuevos valores
        models.User.create(users, function (err, users) {
            console.log("    Creados los usuarios");
            eventEmitter.emit('#Finalizado', res);
        });
    });

    eventEmitter.on('#Finalizado', function (res) {
        finalizado++;
        if (finalizado === 9) {
            res.json({"error": "false", "message": "Datos cargados"});
        }
    });

    // Asigno los router a sus rutas
    app.use('/dev', mongoRouter);
};

//Use new Aggregate({ $match: { _id: mongoose.Schema.Types.ObjectId('00000000000000000000000a') } }); instead.
