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

var Game   = require(basePath + 'src/main/models/game')(mongoose),
    User   = require(basePath + 'src/main/models/user')(mongoose),
    config = require(basePath + 'src/main/modules/config'),
    events = require('events'),
    Q      = require('q');

//Gestor de eventos
var eventEmitter = new events.EventEmitter();

// Esto se ejecutará a la 1 de la mañana
hora = 1;
if (hora !== 1) {
    salir();
}
dia = 6;
switch (dia) {
    case 1: // Los lunes pongo las partidas en estado batalla, las que están en estado WEEKEND
        Game.update({"status": config.GAME_STATUS.WEEKEND}, {"status": config.GAME_STATUS.BATTLE}, {multi: true},
            function (error, num) {
                if (error) {
                    console.error(error);
                    salir();
                }

                console.log('Partidas en estado WEEKEND después del fin de semana se ponen en BATALLA.');
                salir();
            }
        );
        break;
    case 5: //viernes pongo las partidas en negociacion
        Game.update({"status": config.GAME_STATUS.BATTLE}, {"status": config.GAME_STATUS.BUSINESS}, {multi: true},
            function (error, num) {
                if (error) {
                    console.error(error);
                    salir();
                }

                console.log('Partidas en estado BATALLA el viernes se ponen en NEGOCIACION.');

                //Ahora hago la conversión reputación a tostólares para los jugadores
                givePlayersTostolares();

                salir();
            }
        );
        break;
    case 6: //sabado
        gameFridayCloseAndCreate();
        break;
    default:
        salir();
}

/**
 * Da a los jugadores sus tostólares, dependiendo de la reputación que hayan logrado
 */
function givePlayersTostolares() {
    // Saco las partidas en negocio
    Game.find({"status": config.GAME_STATUS.BUSINESS})
        .exec(function (error, games) {
            if (error) {
                console.error(error);
                salir();
            }

            var promises = [], jugadores = [];

            // Saco todos los jugadores
            games.forEach(function (game) {
                // Si es recursivo lo reseteo
                jugadores.concat(game.players);
            });

            // Quito duplicados en el array de jugadores
            jugadores = jugadores.filter(function (elem, pos) {
                return jugadores.indexOf(elem) == pos;
            });

            // Doy tostolares
            User.find({'_id': {$in: jugadores}})
                .exec(function (error, jugadores) {
                    if (error) {
                        console.error(error);
                        salir();
                    }

                    jugadores.forEach(function (jugador) {
                        jugador.game.tostolares = Math.round(jugador.game.stats.reputation / config.DEFAULTS.REPUTATION_TO_TOSTOLARES_CONVERSION);
                        jugador.game.stats.reputation -= jugador.game.tostolares * config.DEFAULTS.REPUTATION_TO_TOSTOLARES_CONVERSION;

                        promises.push(jugador.save());
                    });
                });

            Q.allSettled(promises)
                .then(function (results) {
                    var resultado = true, razon;
                    results.forEach(function (result) {
                        if (result.state !== "fulfilled") {
                            resultado = result.value;
                            razon = result.reason;
                        }
                    });

                    if (resultado !== true) {
                        console.error(razon);
                        salir();
                    }

                    console.log('Hemos dado los tostólares a los jugadores');
                    salir();
                });
        });
}

/**
 * Las partidas en estado 3 las cierro. Si era recursiva en su lugar la reseteo, y a los jugadores reseteo:
 * notificaciones, cambio el pedido actual y el anterior, y el objeto game.
 */
function gameFridayCloseAndCreate() {
    Game.find({"status": config.GAME_STATUS.RESOLUTION})
        .exec(function (error, games) {
            if (error) {
                console.error(error);
                salir();
            }

            var promises = [], jugadoresReset = [], jugadoresClean = [];

            games.forEach(function (game) {
                // Si es recursivo lo reseteo
                if (game.repeat) {
                    game.status = config.GAME_STATUS.WEEKEND;
                    game.caller = null;
                    game.notifications = [];

                    // Jugadores a resetear
                    jugadoresReset.concat(game.players);
                } else {
                    // Si no lo cierro y punto
                    game.status = config.GAME_STATUS.CLOSED;

                    // Jugadores a limpiar
                    jugadoresClean.concat(game.players);
                }

                promises.push(game.save());
            });

            // Quito duplicados en el array de jugadores a resetear
            jugadoresReset = jugadoresReset.filter(function (elem, pos) {
                return jugadoresReset.indexOf(elem) == pos;
            });
            jugadoresClean = jugadoresClean.filter(function (elem, pos) {
                return jugadoresClean.indexOf(elem) == pos;
            });

            // Reseteo jugadores
            User.find({'_id': {$in: jugadoresReset}})
                .exec(function (error, jugadores) {
                    if (error) {
                        console.error(error);
                        salir();
                    }

                    jugadores.forEach(function (jugador) {
                        // Hago el reset
                        jugador.game.stats = {
                            life: config.DEFAULTS.MAX_LIFE,
                            fury: 0,
                            fury_mode: 0,
                            reputation: 0,
                            action_points: config.DEFAULTS.TOAST_POINTS
                        };
                        jugador.game.conditions = [];
                        jugador.game.afk = false;
                        jugador.game.last_order = jugador.game.order;
                        jugador.game.order = {
                            meal: null,
                            drink: null,
                            ito: false
                        };
                        jugador.game.notifications = [];

                        promises.push(jugador.save());
                    });
                });

            // Limpio jugadores
            User.find({'_id': {$in: jugadoresClean}})
                .exec(function (error, jugadores) {
                    if (error) {
                        console.error(error);
                        salir();
                    }

                    jugadores.forEach(function (jugador) {
                        // Hago el clean
                        jugador.leader = false;
                        jugador.game.tostolares = 0;
                        jugador.game.gamedata = null;
                        jugador.game.stats = {
                            life: config.DEFAULTS.MAX_LIFE,
                            fury: 0,
                            fury_mode: 0,
                            reputation: 0,
                            action_points: config.DEFAULTS.TOAST_POINTS
                        };
                        jugador.game.conditions = [];
                        jugador.game.afk = false;
                        jugador.game.last_order = jugador.game.order;
                        jugador.game.order = {
                            meal: null,
                            drink: null,
                            ito: false
                        };
                        jugador.game.notifications = [];

                        promises.push(jugador.save());
                    });
                });

            Q.allSettled(promises)
                .then(function (results) {
                    var resultado = true, razon;
                    results.forEach(function (result) {
                        if (result.state !== "fulfilled") {
                            resultado = result.value;
                            razon = result.reason;
                        }
                    });

                    if (resultado !== true) {
                        console.error(razon);
                        salir();
                    }

                    console.log('Partidas que estaban RESUELTAS las CIERRO y creo las nuevas si eran recursivas');
                    eventEmitter.emit('gameFridayContinue');
                });
        });
}

/**
 * Las partidas en estado 2 se ponen a 0. De momento no reseteo reputaciones y demás
 */
eventEmitter.on('gameFridayContinue', function () {
    Game.update({"status": config.GAME_STATUS.BUSINESS}, {"status": config.GAME_STATUS.WEEKEND}, {multi: true},
        function (error, num) {
            if (error) {
                console.error(error);
                salir();
            }

            console.log('Partidas en estado NEGOCIACIONES no se cerraron y pasan a WEEKEND para continuar la semana que viene.');
            salir();
        }
    );

    // Esto no me hace falta de momento
    /*Game.find({"status": config.GAME_STATUS.BUSINESS})
     .exec(function (error, games) {
     if (error) {
     console.error(error);
     salir();
     }

     var promises = [];

     games.forEach(function (game) {
     // Lo cierro y creo uno nuevo si es que era recursivo
     game.status = config.GAME_STATUS.WEEKEND;
     promises.push(game.save());
     });
     });*/
});

function salir() {
    mongoose.disconnect();
    process.exit();
}
