var express = require('express');
var bcrypt = require('bcryptjs');
var fs = require('fs');

var mdAutenticacion = require('../middleware/autenticacion');

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

            Usuario.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    totalUsuarios: conteo
                });
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
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar usuario',
                errors: err
            });
        }

        usuarioGuardado.password = '******';
        return res.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            mensaje: 'Usuario guardado exitosamente',
            usuarioToken: req.usuario
        });
    });
});

// ==============================================
// Actualizar usuario por ID
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, '-password')
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No se encontró usuario con el ID: ${ id }`,
                    errors: {
                        message: 'No se encontró usuario con el ID'
                    }
                });
            }

            usuarioDB.nombre = body.nombre;
            usuarioDB.email = body.email;
            usuarioDB.role = body.role;

            usuarioDB.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioActualizado,
                    mensaje: 'Usuario actualizado exitosamente'
                });
            });
        });
});

// ==============================================
// Borrar usuario por ID
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id)
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Erro al borrar usuario',
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `No se encontró usuario con el ID: ${ id }`,
                    errors: {
                        message: 'No se encontró usuario con ese ID'
                    }
                });
            }

            var imgPath = `./uploads/usuarios/${ usuarioDB.img }`;
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
            return res.status(200).json({
                ok: false,
                usuario: usuarioDB,
                mensaje: 'Usuario borrado exitosamente'
            });
        });
});

module.exports = app;