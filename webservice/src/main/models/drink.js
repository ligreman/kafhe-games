'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para la bebida, coleccion Drinks
    var DrinkSchema = mongoose.Schema({
        name: String,
        ito: Boolean
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Drink', DrinkSchema);
};