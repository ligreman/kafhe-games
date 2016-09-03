'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para la comida, coleccion Meals
    var MealSchema = mongoose.Schema({
        id: {type: String, unique: true, required: true},
        name: String,
        ito: Boolean
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Meal', MealSchema);
};
