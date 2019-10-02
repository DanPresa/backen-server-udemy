var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ==============================================
// Login google
// ==============================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch((err) => {
            return res.status(404).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                });
            } else {
                response(usuarioDB, res);
            }
        } else {
            // Usuario no existe... hay que crearlo
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: '******'
            });

            usuario.save((err, usuarioDB) => {
                response(usuarioDB, res);
            });
        }
    });

    /* return res.status(200).json({
        ok: true,
        mensaje: 'Petición google',
        googleUser: googleUser
    }); */
});

// ==============================================
// Login normal
// ==============================================
app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email })
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error buscar usuario',
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - email'
                });
            }

            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - password'
                });
            }

            // Crear token
            usuarioDB.password = '******';

            response(usuarioDB, res);
        });
});

function response(usuarioDB, res) {
    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 hrs

    return res.status(200).json({
        ok: true,
        usuario: usuarioDB,
        token: token,
        id: usuarioDB._id
    });
}

module.exports = app;