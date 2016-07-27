'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Admins
    var AdminSchema = mongoose.Schema({
        username: {type: String, unique: true, required: true},
        password: {type: String, select: false, required: true}
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Admin', AdminSchema);
};
