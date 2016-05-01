'use strict';

//Este módulo crea los modelos de base de datos
module.exports = function (mongoose) {
    //Creo los modelos
    require('./session')(mongoose);
    require('./meal')(mongoose);
    require('./drink')(mongoose);
    require('./skill')(mongoose);
    require('./shop')(mongoose);
    require('./game')(mongoose);
    require('./user')(mongoose);
    require('./admin')(mongoose);
};
