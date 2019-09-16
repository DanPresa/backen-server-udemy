var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

var Hospital = require('../models/hospital');
// ==============================================
// Obtener todos los hospitales
// ==============================================
app.get('/', (req, res) => {
    Hospital.find({})
        .populate('usuario', '-password -role')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error buscar hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    totalHospitales: conteo
                });
            });
        });
});

// ==============================================
// Guardar hospital
// ==============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar hospital',
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            mensaje: 'Hospital creado exitosamente'
        });
    });
});

// ==============================================
// Actualizar hospital por ID
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error buscar hospital',
                errors: err
            });
        }

        if (!hospitalDB) {
            return res.status(404).json({
                ok: false,
                mensaje: `No existe hospital con el ID: ${ id }`,
                errors: {
                    message: 'No existe hospital con ese ID'
                }
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });
});

// ==============================================
// Borrar hospital por ID
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id)
        .populate('usuario', '-password')
        .exec((err, hospitalDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error buscar hospital',
                    errors: err
                });
            }

            if (!hospitalDB) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `No existe hospital con el ID: ${ id }`,
                    errors: {
                        message: 'No existe hospital con ese ID'
                    }
                });
            }

            var imgPath = `./uploads/hospitales/${ hospitalDB.img }`;
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalDB
            });
        });
});

module.exports = app;