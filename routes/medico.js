var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ==============================================
// Obtener todos los medicos
// ==============================================
app.get('/', (req, res) => {
    Medico.find({})
        .populate('usuario', '-password -role')
        .populate('hospital', 'nombre')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error buscar médicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    totalMedicos: conteo
                });
            });
        });
});

// ==============================================
// Guardar medico
// ==============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar usuario',
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            mensaje: 'Médico creado exitosamente'
        });
    });
});

// ==============================================
// Actualizar médico por ID
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error encontrar médico',
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(404).json({
                ok: false,
                mensaje: `No se encontró médico con el ID: ${ id }`,
                errors: {
                    message: 'No se encontró médico con ese id'
                }
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.usuario = req.usuario;
        medicoDB.hospital = body.hospital;

        medicoDB.save((err, medicoActualizado) => {
            if (err) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Error actualizar médico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoActualizado,
                mensaje: 'Médico actualizado exitosamente'
            });
        });
    });
});

// ==============================================
// Borrar médico por el ID
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(404).json({
                ok: false,
                mensaje: `No se encontró médico con el ID: ${ id }`,
                errors: {
                    message: 'No se encontró usuario con ese ID'
                }
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoDB,
            mensaje: 'Medico borrado exitosamente'
        });
    });
});

module.exports = app;