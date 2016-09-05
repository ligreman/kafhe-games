'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Users
    var SkillSchema = mongoose.Schema({
        id: {type: String, unique: true, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        action: {type: String, required: true},
        uses: {type: Number, required: true}
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Skill', SkillSchema);
};
