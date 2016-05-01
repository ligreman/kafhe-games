'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para las sesiones de usuario, coleccion Session
    var SessionSchema = mongoose.Schema({
        username: {type: String, unique: true, required: true},
        token: {type: String, required: true},
        timestamp: Number
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Session', SessionSchema);
};