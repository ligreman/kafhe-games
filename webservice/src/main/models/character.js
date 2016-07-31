'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {
    // los *_id se cargan al entrar en el juego para no andar mandándo todo en cada petición. Se puede guardar en el storage
    // local con la versión de los datos (versión del juego)

    var LogSchema = mongoose.Schema({
        text: String,
        'type': {type: String},
        subtype: String,
        date: Number
    });

    //Modelo para los usuarios, coleccion Character
    var CharacterSchema = mongoose.Schema({
            name: String,
            level: Number,
            location: {
                place_id: String,
                sector: String,
                latitude: Number,
                longitude: Number
            },
            stats: {
                damage: Number,
                reduction: Number,
                life: Number,
                toxicity: Number,
                perception: Number,
                reflexes: Number,
                stealth: Number,
                hunger: Number,
                fatigue: Number,
                venom: Number,
                healing: Number
            },
            score: Number,
            talents: {
                points: Number,
                combat: [{
                    talent_id: String,
                    points: Number
                }],
                survival: [{
                    talent_id: String,
                    points: Number
                }],
                exploration: [{
                    talent_id: String,
                    points: Number
                }]
            },
            log: [LogSchema],
            skill_slots: Number,
            skills: [{
                skill_id: String,
                uses: Number
            }],
            inventory_slots: Number,
            inventory: {
                object_id: String,
                uses: Number
            },
            weapon: {
                name: String,
                ammo: Number,
                damage: Number,
                accuracy: Number,
                level: Number
            }
        },
        {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Character', CharacterSchema);
};
