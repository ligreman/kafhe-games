'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Users
    var TalentSchema = mongoose.Schema({
        id: {type: String, unique: true, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        branch: {type: String, required: true, enum: ['combat', 'exploration', 'survival']},
        skills: [String], // Array de ids de skills que otorga este talento
        required: [String] // Array de ids de talentos requeridos
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Talent', TalentSchema);
};
