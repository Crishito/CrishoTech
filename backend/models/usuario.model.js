// Importación de Mongoose para crear el esquema y modelo de usuario.
const mongoose = require('mongoose');

// Esquema que define la estructura de los usuarios en MongoDB.
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// Exporta el modelo Usuario y lo vincula con la colección usuarios.
module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');