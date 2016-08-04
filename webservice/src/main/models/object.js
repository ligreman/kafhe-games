'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Users
    var ObjectSchema = mongoose.Schema({
        id: {type: String, unique: true, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        uses: {type: Number, default: 0}
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Object', ObjectSchema);
};
