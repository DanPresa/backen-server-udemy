var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ROLE_ADMIN', 'ROLE_USER'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, default: 'ROLE_USER', required: true, enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);