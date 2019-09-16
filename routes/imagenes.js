var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;

    var imgPath = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
    } else {
        var noImagePath = path.resolve(__dirname, `../assets/noimage.png`);
        res.sendFile(noImagePath);
    }

    /* res.status(200).json({
        ok: false,
        mensaje: 'Petición realizada exitosamente'
    }); */
});

module.exports = app;