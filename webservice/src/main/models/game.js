'use strict';

//Módulo para un modelo de Mongoose. Hay que pasarle el objeto mongoose ya creado antes.
module.exports = function (mongoose) {
    // var notificationSchema = require('./notificationSchema')(mongoose);


    //Modelo para los usuarios, coleccion Games
    var GameSchema = mongoose.Schema({
        repeat: Boolean,
        status: {type: Number, default: 0},
        caller: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
        // notifications: [notificationSchema]
    }, {versionKey: false});

    //Declaro y devuelvo el modelo
    return mongoose.model('Game', GameSchema);
};
