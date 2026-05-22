const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  rol: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const solicitudSchema = new mongoose.Schema({
  servicio: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  cedula: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    default: 'Recibido'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  chat: {
    type: [mensajeSchema],
    default: []
  }
});

module.exports = mongoose.model('Solicitud', solicitudSchema);