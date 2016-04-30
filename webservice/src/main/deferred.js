//var express = require('express');
//var app = express();
//var mongoose = require('mongoose');
//var session = require('express-session');
var Q = require('q');
//var MongoStore = require('connect-mongo')(session);


var a = function () {
    var defer = Q.defer();

    setTimeout(function () {
        var r = Math.floor((Math.random() * 10) + 1);
        if (false) {
            defer.resolve('SISISI');
        } else {
            defer.reject('NONONO');
        }
    }, 1000);

    return defer.promise;
};

var b = function (valor) {
    var defer = Q.defer();

    console.log('Entro en B:' + valor);

    setTimeout(function () {
        var r = Math.floor((Math.random() * 10) + 1);
        if (true) {
            defer.resolve('SISISI B');
        } else {
            defer.reject('NONONO B');
        }
    }, 1000);

    return defer.promise;
};


Q.fcall(a)
    .then(b, function (err) {
        console.log('Error en A:' + err);
    })
    .done(function (out) {
        console.log('OUT:' + out);
    }, function (error) {
        console.log(error);
    });


/*
 // Basic usage
 mongoose.connect('mongodb://localhost/sesiones');
 var db = mongoose.connection;

 app.use(session({
 secret: 'patata2',
 resave: true,
 saveUninitialized: true,
 name: 'nombrecookie',
 store: new MongoStore({
 mongooseConnection: db,
 hash: {
 salt: 'salteado de papas'
 }
 })
 }));

 app.get('/set/:data', function (req, res) {
 req.session.dato = req.params.data;
 res.send('What a radical visit!');
 });

 app.get('/get', function (req, res) {
 console.log("En sesion: " + req.session.dato);
 res.send('Are you a surfer? ' + req.session.dato);
 });


 app.use(express.cookieParser());
 app.use(express.session({secret: '1234567890QWERTY'}));

 app.get('/awesome', function(req, res) {
 if(req.session.lastPage) {
 console.log('Last page was: ' + req.session.lastPage + '. ');
 }

 req.session.lastPage = '/awesome';
 res.send('Your Awesome.');
 });

 app.get('/set/:data', function(req, res) {
 if(req.session.lastPage) {
 console.log('Last page was: ' + req.session.lastPage + '. ');
 }

 req.session.lastPage = '/set';
 req.session.dato = req.params.data;
 res.send('What a radical visit!');
 });

 app.get('/get', function(req, res) {
 if(req.session.lastPage) {
 console.log('Last page was: ' + req.session.lastPage + '. ');
 }

 req.session.lastPage = '/get';
 console.log("En sesion: "+req.session.dato);
 res.send('Are you a surfer? ' +req.session.dato);
 });

 app.listen(process.env.PORT || 8080);
 */