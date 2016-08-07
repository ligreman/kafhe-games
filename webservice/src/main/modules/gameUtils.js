'use strict';

var console  = process.console,
    mongoose = require('mongoose'),
    modelos  = require('../models/models')(mongoose);


var calculateProbabilitiesByRank = function (idGame) {
    var xProporcion                      = 1,
        xRango                           = 10,
        xSuma = 0, valores = {}, finales = {};

    modelos.User
        .find({"game.gamedata": idGame}, function (err, users) {
            // Por cada usuario
            users.forEach(function (user) {
                var proporcion = user.times / (user.calls + 1);
                var valor = (xProporcion * proporcion) + (Math.pow(user.game.level, 2) * xRango);
                xSuma += valor;
                valores[user._id] = valor;
            });

            // Calculo el valor final
            users.forEach(function (user) {
                finales[user._id] = ((valores[user._id] / xSuma) * 100).toPrecision(4);
            });
        });

    return finales;
};

module.exports = {
    calculateProbabilitiesByRank: calculateProbabilitiesByRank
};
