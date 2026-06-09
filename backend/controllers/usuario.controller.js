const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // Encriptamos la contraseña antes de guardarla en MongoDB.
    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      correo,
      password: passwordEncriptada,
      rol: rol || 'usuario'
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        fechaRegistro: nuevoUsuario.fechaRegistro
      }
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar usuario.',
      error: error.message
    });
  }
};

// Login con bcrypt + JWT
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

    // Comparamos la contraseña ingresada con la contraseña encriptada.
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Contraseña incorrecta.'
      });
    }

    // Creamos el token JWT con datos básicos del usuario.
    const token = jwt.sign(
      {
        id: usuario._id,
        correo: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    );

    res.json({
      mensaje: 'Inicio de sesión correcto.',
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        fechaRegistro: usuario.fechaRegistro
      }
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
    const usuarios = await Usuario.find()
      .select('-password')
      .sort({ fechaRegistro: -1 });

    res.json(usuarios);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener usuarios.',
      error: error.message
    });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, password, rol } = req.body;

    if (!nombre || !apellido || !correo || !rol) {
      return res.status(400).json({
        mensaje: 'Nombre, apellido, correo y rol son obligatorios.'
      });
    }

    const datosActualizados = {
      nombre,
      apellido,
      correo,
      rol
    };

    // Si el admin escribe una nueva contraseña, se guarda encriptada.
    if (password && password.trim() !== '') {
      datosActualizados.password = await bcrypt.hash(password, 10);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    res.json({
      mensaje: 'Usuario actualizado correctamente.',
      usuario: usuarioActualizado
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar usuario.',
      error: error.message
    });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    res.json({
      mensaje: 'Usuario eliminado correctamente.'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar usuario.',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
};