// Requires
var express = require('express');
var mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

// Inicializar variables
var app = express();

// Conexión a la DB
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Importar rutas
var appRoutes = require('./routes/app');

// Rutas
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(PORT, () => {
    console.log('Express server puerto: ' + PORT + ' \x1b[32m%s\x1b[0m', 'online');
});