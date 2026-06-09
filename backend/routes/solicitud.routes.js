const express = require('express');
const router = express.Router();

const Solicitud = require('../models/solicitud.model');

// Función para validar correo electrónico.
const correoValido = (correo) => {
  const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return expresion.test(correo);
};

// Función para validar que un texto tenga solo letras y espacios.
const soloLetras = (texto) => {
  const expresion = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
  return expresion.test(texto);
};

// Función para validar los datos principales de una solicitud.
const validarSolicitud = (datos) => {
  const errores = [];

  if (!datos.servicio || datos.servicio.trim() === '') {
    errores.push('El servicio es obligatorio.');
  }

  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.push('El nombre es obligatorio.');
  } else if (!soloLetras(datos.nombre.trim())) {
    errores.push('El nombre debe contener solo letras.');
  }

  if (!datos.cedula || datos.cedula.trim() === '') {
    errores.push('La cédula es obligatoria.');
  } else if (!/^\d{10}$/.test(datos.cedula)) {
    errores.push('La cédula debe tener exactamente 10 números.');
  }

  if (!datos.telefono || datos.telefono.trim() === '') {
    errores.push('El teléfono es obligatorio.');
  } else if (!/^\d{10}$/.test(datos.telefono)) {
    errores.push('El teléfono debe tener exactamente 10 números.');
  }

  if (!datos.correo || datos.correo.trim() === '') {
    errores.push('El correo es obligatorio.');
  } else if (!correoValido(datos.correo)) {
    errores.push('El correo no tiene un formato válido.');
  }

  if (!datos.direccion || datos.direccion.trim() === '') {
    errores.push('La dirección es obligatoria.');
  }

  if (!datos.descripcion || datos.descripcion.trim() === '') {
    errores.push('La descripción es obligatoria.');
  }

  if (datos.estado && !['Recibido', 'En Proceso', 'Completado'].includes(datos.estado)) {
    errores.push('El estado ingresado no es válido.');
  }

  return errores;
};

// CREATE - guardar una nueva solicitud en MongoDB
router.post('/', async (req, res) => {
  try {
    const errores = validarSolicitud(req.body);

    if (errores.length > 0) {
      return res.status(400).json({
        mensaje: 'Existen errores en los datos enviados.',
        errores
      });
    }

    const nuevaSolicitud = new Solicitud({
      servicio: req.body.servicio.trim(),
      nombre: req.body.nombre.trim(),
      cedula: req.body.cedula.trim(),
      telefono: req.body.telefono.trim(),
      correo: req.body.correo.trim().toLowerCase(),
      direccion: req.body.direccion.trim(),
      descripcion: req.body.descripcion.trim(),
      estado: req.body.estado || 'Recibido',
      usuarioEmail: req.body.usuarioEmail || '',
      chat: req.body.chat || []
    });

    const solicitudGuardada = await nuevaSolicitud.save();

    res.status(201).json({
      mensaje: 'Solicitud creada correctamente',
      solicitud: solicitudGuardada
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear la solicitud',
      error: error.message
    });
  }
});

// READ - obtener todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const solicitudes = await Solicitud.find().sort({ fecha: -1 });

    res.json(solicitudes);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las solicitudes',
      error: error.message
    });
  }
});

// CHAT - agregar mensaje al chat de una solicitud
router.put('/:id/chat', async (req, res) => {
  try {
    const { rol, nombre, mensaje } = req.body;

    if (!rol || !nombre || !mensaje) {
      return res.status(400).json({
        mensaje: 'Faltan datos para enviar el mensaje.'
      });
    }

    if (!['usuario', 'admin'].includes(rol)) {
      return res.status(400).json({
        mensaje: 'El rol del mensaje no es válido.'
      });
    }

    if (nombre.trim() === '') {
      return res.status(400).json({
        mensaje: 'El nombre del remitente es obligatorio.'
      });
    }

    if (mensaje.trim() === '') {
      return res.status(400).json({
        mensaje: 'El mensaje no puede estar vacío.'
      });
    }

    const solicitud = await Solicitud.findById(req.params.id);

    if (!solicitud) {
      return res.status(404).json({
        mensaje: 'Solicitud no encontrada.'
      });
    }

    solicitud.chat.push({
      rol,
      nombre: nombre.trim(),
      mensaje: mensaje.trim(),
      fecha: new Date()
    });

    await solicitud.save();

    res.json({
      mensaje: 'Mensaje agregado correctamente',
      solicitud
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al agregar mensaje',
      error: error.message
    });
  }
});

// UPDATE - actualizar solicitud por id
router.put('/:id', async (req, res) => {
  try {
    /*
      Si solo se actualiza el estado o el chat, no obligamos a mandar todos los campos.
      Esto evita dañar funciones como cambiar estado o actualizar chat.
    */
    const soloEstado = Object.keys(req.body).length === 1 && req.body.estado;
    const soloChat = Object.keys(req.body).length === 1 && req.body.chat;

    if (!soloEstado && !soloChat) {
      const errores = validarSolicitud(req.body);

      if (errores.length > 0) {
        return res.status(400).json({
          mensaje: 'Existen errores en los datos enviados.',
          errores
        });
      }
    }

    if (req.body.estado && !['Recibido', 'En Proceso', 'Completado'].includes(req.body.estado)) {
      return res.status(400).json({
        mensaje: 'El estado ingresado no es válido.'
      });
    }

    const datosActualizados = { ...req.body };

    if (datosActualizados.correo) {
      datosActualizados.correo = datosActualizados.correo.trim().toLowerCase();
    }

    if (datosActualizados.nombre) {
      datosActualizados.nombre = datosActualizados.nombre.trim();
    }

    if (datosActualizados.servicio) {
      datosActualizados.servicio = datosActualizados.servicio.trim();
    }

    if (datosActualizados.direccion) {
      datosActualizados.direccion = datosActualizados.direccion.trim();
    }

    if (datosActualizados.descripcion) {
      datosActualizados.descripcion = datosActualizados.descripcion.trim();
    }

    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      {
        new: true,
        runValidators: true
      }
    );

    if (!solicitudActualizada) {
      return res.status(404).json({
        mensaje: 'Solicitud no encontrada.'
      });
    }

    res.json({
      mensaje: 'Solicitud actualizada correctamente',
      solicitud: solicitudActualizada
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar la solicitud',
      error: error.message
    });
  }
});

// DELETE - eliminar solicitud por id
router.delete('/:id', async (req, res) => {
  try {
    const solicitudEliminada = await Solicitud.findByIdAndDelete(req.params.id);

    if (!solicitudEliminada) {
      return res.status(404).json({
        mensaje: 'Solicitud no encontrada.'
      });
    }

    res.json({
      mensaje: 'Solicitud eliminada correctamente'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar la solicitud',
      error: error.message
    });
  }
});

module.exports = router;