var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

// ==============================================
// Obtener todos los usuarios
// ==============================================
app.get('/', (req, res) => {
    Usuario.find({})
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error buscar usuarios',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

module.exports = app;