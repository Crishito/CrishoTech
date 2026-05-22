const express = require('express');
const router = express.Router();

const Solicitud = require('../models/solicitud.model');

// CREATE - guardar una nueva solicitud en MongoDB
router.post('/', async (req, res) => {
  try {
    const nuevaSolicitud = new Solicitud(req.body);

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
// CHAT - agregar mensaje a una solicitud
router.put('/:id/chat', async (req, res) => {
  try {
    const { rol, nombre, mensaje } = req.body;

    if (!rol || !nombre || !mensaje) {
      return res.status(400).json({
        mensaje: 'Faltan datos para enviar el mensaje'
      });
    }

    const solicitud = await Solicitud.findById(req.params.id);

    if (!solicitud) {
      return res.status(404).json({
        mensaje: 'Solicitud no encontrada'
      });
    }

    solicitud.chat.push({
      rol,
      nombre,
      mensaje,
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
    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!solicitudActualizada) {
      return res.status(404).json({
        mensaje: 'Solicitud no encontrada'
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
        mensaje: 'Solicitud no encontrada'
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