var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email })
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Error buscar usuario',
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - email'
                });
            }

            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - password'
                });
            }

            // Crear token
            usuarioDB.password = '******';
            var token = jwt.sign({ usuario: usuarioDB }, 'seed-hospitaldb', { expiresIn: 14400 }); // 4 hrs

            return res.status(200).json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });
        });
});

module.exports = app;