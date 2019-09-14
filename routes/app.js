var express = require('express');

var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: false,
        mensaje: 'Petición realizada exitosamente'
    });
});

module.exports = app;