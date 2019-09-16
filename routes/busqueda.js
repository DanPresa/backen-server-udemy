var express = require('express');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// ==============================================
// Búsqueda por colección
// ==============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    var promesa;

    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regExp);
            break;
        case 'medicos':
            promesa = buscarMedicos(regExp);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regExp);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: `Los tipos de búsqueda solo son: ${ tiposValidos.join(', ') }`,
                errors: { message: 'Tipo de colección no válida' }
            });
    }

    promesa.then((resp) => {
        res.status(200).json({
            ok: true,
            [tabla]: resp
        });
    });
});

// ==============================================
// Busqueda general
// ==============================================
app.get('/todo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    Promise.all([
        buscarUsuarios(regExp),
        buscarMedicos(regExp),
        buscarHospitales(regExp)
    ]).then((value) => {
        return res.status(200).json({
            ok: true,
            usuarios: value[0],
            medicos: value[1],
            hospitales: value[2]
        });
    });
});

function buscarUsuarios(regExp) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, '-password')
            .or([
                { nombre: regExp },
                { email: regExp }
            ])
            .exec((err, usuarios) => {
                if (err) reject('Error al cargar usuarios');

                resolve(usuarios);
            });
    });
}

function buscarMedicos(regExp) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regExp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) reject('Error al cargar medicos', err);

                resolve(medicos);
            });
    });
}

function buscarHospitales(regExp) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regExp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) reject('Error al cargar hospitales', err);

                resolve(hospitales);
            });
    });
}

module.exports = app;