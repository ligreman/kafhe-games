'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {
    // los *_id se cargan al entrar en el juego para no andar mandándo todo en cada petición. Se puede guardar en el storage
    // local con la versión de los datos (versión del juego)

    var LogSchema = mongoose.Schema({
        text: {type: String, required: true},
        'type': {type: String, enum: ['combat', 'exploration'], required: true}, // combat, exploration,
        subtype: {type: String, enum: ['extended', ''], default: ''}, // extended
        date: {type: Number, default: 0}
    }, {versionKey: false});

    //Modelo para los usuarios, coleccion Character
    var CharacterSchema = mongoose.Schema({
            name: {type: String, default: ''},
            name_changed: {type: Boolean, default: false},
            level: {type: Number, default: 1},
            location: {
                place: {type: String, default: ''},
                level: {type: Number, default: 0} // 0 superficie
            },
            stats: {
                // damage: {type: Number, default: 0},
                // reduction: {type: Number, default: 0},
                // life: {type: Number, default: 0},
                toxicity: {type: Number, default: 0}
                // perception: {type: Number, default: 0},
                // reflexes: {type: Number, default: 0},
                // stealth: {type: Number, default: 0},
                // hunger: {type: Number, default: 0},
                // fatigue: {type: Number, default: 0},
                // venom: {type: Number, default: 0},
                // healing: {type: Number, default: 0}
            },
            score: {type: Number, default: 0},
            talents: {
                points: {type: Number, default: 0},
                combat: [{type: String}],
                survival: [{type: String}],
                exploration: [{type: String}]
            },
            log: [LogSchema],
            skill_slots: {type: Number, default: 0},
            skills: [{
                skill: {type: String, required: true},
                uses: {type: Number, default: 0}
            }],
            inventory_slots: {type: Number, default: 0},
            inventory: {
                object: {type: String, required: true},
                uses: {type: Number, default: 0}
            },
            weapon: {
                name: {type: String, required: true},
                ammo: {type: Number, default: 0},
                damage: {type: Number, default: 0},
                accuracy: {type: Number, default: 0},
                level: {type: Number, default: 0}
            }
        },
        {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Character', CharacterSchema);
};
