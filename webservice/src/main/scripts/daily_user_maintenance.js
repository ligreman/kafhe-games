'use strict';

var b = new Date();
var amas = b.getTimezoneOffset();
// Sumo la hora para obtener GMT+1
amas += 60;

var fecha = new Date(b.getTime() + (amas * 60 * 1000)),
    hora  = fecha.getHours(), //0-23
    dia   = fecha.getDay(); //0-6 siendo 0 domingo

var basePath = process.env.OPENSHIFT_REPO_DIR || 'D:\\Workspace\\www\\kafhe_4.0\\development\\webservice\\';
var mongoose = require('mongoose');
var mongoHost = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || 'mongodb://localhost/kafhe';
mongoose.connect(mongoHost, {});

var User   = require(basePath + 'src/main/models/user')(mongoose),
    config = require(basePath + 'src/main/modules/config');

// A las 2am todos los días
if
(hora === 2) {
    User.update({}, {"game.stats.toast_points": config.DEFAULTS.TOAST_POINTS}, {multi: true},
        function (error, num) {
            if (error) {
                console.error(error);
                return;
            }

            console.log('Puntos de tueste de los usuarios recargados.');
            process.exit();
        }
    );
}
else {
    process.exit();
}
