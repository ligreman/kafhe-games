'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Users
    var PlaceSchema = mongoose.Schema({
        id: {type: String, unique: true, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        latitude: Number,
        longitude: Number,
        zone: {type: String, enum: ['swamp', 'desert', 'jungle', 'mountain']},
        type: {type: String, enum: ['surface', 'dungeon']},
        category: {type: String, enum: ['building', 'camp', 'castle', 'cave']},
        level: Number
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Place', PlaceSchema);
};
