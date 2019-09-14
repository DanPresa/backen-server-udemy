var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

// ==============================================
// Obtener todos los usuarios
// ==============================================
app.get('/', (req, res) => {
    Usuario.find({}, '-password')
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

// ==============================================
// Guardar usuario
// ==============================================
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar usuario',
                errors: err
            });
        }

        return res.status(200).json({
            ok: false,
            usuario: usuarioGuardado,
            mensaje: 'Usuario guardado exitosamente'
        });
    });
});

module.exports = app;