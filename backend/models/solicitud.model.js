// Importación de Mongoose para crear esquemas y modelos.
const mongoose = require('mongoose');

// Esquema para guardar los mensajes del chat dentro de una solicitud.
const mensajeChatSchema = new mongoose.Schema({
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
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

// Esquema principal para registrar las solicitudes de servicio.
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
    type: [mensajeChatSchema],
    default: []
  },

  // Este campo permite relacionar la solicitud con el usuario logueado.
  usuarioEmail: {
    type: String
  }
});

// Exporta el modelo Solicitud para usarlo en rutas y controladores.
module.exports = mongoose.model('Solicitud', solicitudSchema);