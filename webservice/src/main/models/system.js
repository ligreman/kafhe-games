'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Admins
    var SystemSchema = mongoose.Schema({
        version: {
            major: Number,
            minor: Number,
            fix: Number
        }
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('System', SystemSchema);
};
