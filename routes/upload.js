var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospitales = require('../models/hospital');

app.put('/:tipo/:id', (req, res) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    var colecciones = ['usuarios', 'medicos', 'hospitales'];
    if (colecciones.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: { message: `Solo se aceptan: ${ colecciones.join(', ') }` }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningún archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre archivo
    var archivo = req.files.imagen;
    var extension = archivo.name.split('.').pop();

    // Extensiones validas
    var extensionesValidas = ['jpg', 'png'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida ' + extension,
            errors: { message: `Solo se admiten archivos: ${ extensionesValidas.join(', ') }` }
        });
    }

    var dia = new Date().getDate();
    var mes = new Date().getMonth() + 1;
    var anio = new Date().getFullYear();
    var date = `${ dia }${ mes }${ anio }`;
    var milliseconds = new Date().getTime();

    var nombreArchivo = `${ id }-${ date }-${ milliseconds }.${ extension }`;
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    // Mover el archivo del temporal a un path
    archivo.mv(path, (err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al subir archivo',
                errros: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    var pathImagen = `./uploads/${ tipo }`;

    if (tipo === 'usuarios') {
        Usuario.findById(id, '-password', (err, usuario) => {
            if (!usuario) {
                return res.status(200).json({
                    ok: true,
                    mensaje: `No existe usuario con el id: ${ id }`,
                    errors: { message: 'No existe usuario con ese id' }
                });
            }

            var pathViejo = pathImagen + `/${ usuario.img }`
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(200).json({
                    ok: true,
                    mensaje: `No existe médico con el id: ${ id }`,
                    errors: { message: 'No existe médico con ese id' }
                });
            }

            var pathViejo = pathImagen + `/${ medico.img }`
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospitales.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(200).json({
                    ok: true,
                    mensaje: `No existe hospital con el id: ${ id }`,
                    errors: { message: 'No existe hospital con ese id' }
                });
            }

            var pathViejo = pathImagen + `/${ hospital.img }`;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;