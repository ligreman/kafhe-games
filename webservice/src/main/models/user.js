'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {
    var skillSchema = require('./skillSchema')(mongoose);
    var notificationSchema = require('./notificationSchema')(mongoose);

    //Modelo para los usuarios, coleccion Users
    var UserSchema = mongoose.Schema({
        username: {type: String, unique: true, required: true},
        password: {type: String, select: false, required: true},
        alias: String,
        leader: Boolean,
        times: Number,
        calls: Number,
        avatar: String,
        game: {
            gamedata: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
            rank: Number,
            tostolares: {type: Number, default: 0},
            fame: {type: Number, default: 0},
            team: {
                name: {type: String, default: null},
                location: {
                    name: {type: String, default: null},
                    sector: {type: String, default: null},
                    latitude: {type: String, default: null},
                    longitude: {type: String, default: null},
                    place: {type: String, default: null}
                },
                members: [{
                    id: String,
                    name: {type: String, default: null},
                    'class': {type: String, default: null},
                    level: {type: Number, default: 1},
                    combat_style: {type: String, default: null},
                    strength: {type: String, default: null},
                    vitality: {type: String, default: null},
                    agility: {type: String, default: null},
                    wisdom: {type: String, default: null},
                    current_life: {type: String, default: null},
                    weapon: {type: String, default: null},
                    armor: {type: String, default: null}
                }],
                inventory: [{
                    weapons: [{
                        id: String,
                        name: {type: String, default: null},
                        'type': {type: String, default: null},
                        in_use: Boolean
                    }],
                    armors: [{
                        id: String,
                        name: {type: String, default: null},
                        'type': {type: String, default: null},
                        in_use: Boolean
                    }],
                    utilities: [{
                        id: String,
                        name: {type: String, default: null},
                        'type': {type: String, default: null},
                        in_use: Boolean
                    }]
                }]
            },
            afk: Boolean,
            last_activity: Number,
            order: {
                meal: {type: mongoose.Schema.Types.ObjectId, ref: 'Meal'},
                drink: {type: mongoose.Schema.Types.ObjectId, ref: 'Drink'},
                ito: Boolean
            },
            last_order: {
                meal: {type: mongoose.Schema.Types.ObjectId, ref: 'Meal'},
                drink: {type: mongoose.Schema.Types.ObjectId, ref: 'Drink'},
                ito: Boolean
            },
            notifications: [notificationSchema]
        }
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('User', UserSchema);
};
