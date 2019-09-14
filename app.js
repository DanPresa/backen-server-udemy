// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

// Inicializar variables
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la DB
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/hospitalDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
    })
    .catch((err) => {
        if (err) throw err;
    });

// Importar rutas
var appRoute = require('./routes/app');
var usuarioRoute = require('./routes/usuario');

// Rutas
app.use('/usuario', usuarioRoute);
app.use('/', appRoute);

// Escuchar peticiones
app.listen(PORT, () => {
    console.log('Express server puerto: ' + PORT + ' \x1b[32m%s\x1b[0m', 'online');
});