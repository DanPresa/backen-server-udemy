// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

// Inicializar variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoute = require('./routes/app');
var loginRoute = require('./routes/login');
var usuarioRoute = require('./routes/usuario');
var hospitalRoute = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');
var imgRoute = require('./routes/imagenes');

// Conexión a la DB
mongoose.connect('mongodb://localhost:27017/hospitalDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
    })
    .catch((err) => {
        if (err) throw err;
    });

// Rutas
app.use('/usuario', usuarioRoute);
app.use('/hospital', hospitalRoute);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoute);
app.use('/upload', uploadRoute);
app.use('/img', imgRoute);
app.use('/login', loginRoute);
app.use('/', appRoute);

// Escuchar peticiones
app.listen(PORT, () => {
    console.log('Express server puerto: ' + PORT + ' \x1b[32m%s\x1b[0m', 'online');
});