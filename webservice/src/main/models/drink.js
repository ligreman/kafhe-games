'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para la bebida, coleccion Drinks
    var DrinkSchema = mongoose.Schema({
        // _id: {type: String},
        id: {type: String, unique: true, required: true},
        name: {type: String, required: true},
        ito: {type: Boolean, default: false}
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Drink', DrinkSchema);
};
