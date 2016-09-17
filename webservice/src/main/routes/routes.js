'use strict';

module.exports = function (app) {
    var console = process.console;

    //Cargo las estrategias de las rutas
    require('./strategies')(app);

    //Cargo los diferentes ficheros de rutas
    require('./admin')(app);
    require('./character')(app);
    require('./game')(app);
    require('./login')(app);
    require('./order')(app);
    require('./profile')(app);
    require('./user')(app);

    // require('./skill')(app);
    // require('./equipment')(app);
    // require('./furnace')(app);
    // require('./forge')(app);
    // require('./shop')(app);
    require('./mongoHelper')(app);

    //Fichero de rutas de error
    require('./error')(app);

    //Cualquier otra ruta a la que se acceda, devuelve error
    app.get('/!*', function (req, res) {
        res.status(404).send('Aquí no hay nada ┌∩┐(◣_◢)┌∩┐');
    });
};
