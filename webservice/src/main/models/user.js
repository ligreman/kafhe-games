'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {
    // var skillSchema = require('./skillSchema')(mongoose);
    var notificationSchema = require('./notificationSchema')(mongoose);

    /*
     id
     log
     stats
     score: puntuación que consigue en los juegos
     talents: copia de la plantilla modificada con lo que va el jugador subiendo etc.
     skill_slots
     skills
     skill_id
     uses
     inventory_slots
     inventory
     object_id
     uses
     weapon
     name
     ammo
     damage
     accuracy
     level
     */

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
            character: {type: mongoose.Schema.Types.ObjectId, ref: 'Character'},
            warehouse: [{}],
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
