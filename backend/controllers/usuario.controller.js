const Usuario = require('../models/usuario.model');

// Registrar usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, password, rol } = req.body;

    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios.'
      });
    }

    const usuarioExistente = await Usuario.findOne({ correo });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: 'El correo ya está registrado.'
      });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      correo,
      password,
      rol: rol || 'usuario'
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario: nuevoUsuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar usuario.',
      error: error.message
    });
  }
};

// Login
const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios.'
      });
    }

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    if (usuario.password !== password) {
      return res.status(401).json({
        mensaje: 'Contraseña incorrecta.'
      });
    }

    res.json({
      mensaje: 'Inicio de sesión correcto.',
      usuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al iniciar sesión.',
      error: error.message
    });
  }
};

// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ fechaRegistro: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener usuarios.',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios
};