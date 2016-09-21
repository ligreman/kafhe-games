'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {

    //Modelo para los usuarios, coleccion Users
    var WeaponSchema = mongoose.Schema({
        id: {type: String, unique: true, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        ammo: {type: Number, default: 0},
        damage: {type: Number, default: 0},
        accuracy: {type: Number, default: 0},
        level: {type: Number, default: 0},
        price: {type: Number, default: 0}
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Weapon', WeaponSchema);
};
