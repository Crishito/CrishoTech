// Importaciones necesarias para el controlador de usuarios.
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Función para validar el rol del usuario.
const rolValido = (rol) => {
  return ['usuario', 'admin'].includes(rol);
};

// Registra un nuevo usuario en MongoDB.
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, password, rol } = req.body;

    // Valida que los campos obligatorios estén completos.
    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios.'
      });
    }

    if (!soloLetras(nombre.trim())) {
      return res.status(400).json({
        mensaje: 'El nombre debe contener solo letras.'
      });
    }

    if (!soloLetras(apellido.trim())) {
      return res.status(400).json({
        mensaje: 'El apellido debe contener solo letras.'
      });
    }

    if (!correoValido(correo.trim())) {
      return res.status(400).json({
        mensaje: 'El correo no tiene un formato válido.'
      });
    }

    if (password.trim().length < 8) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener mínimo 8 caracteres.'
      });
    }

    const rolUsuario = rol || 'usuario';

    if (!rolValido(rolUsuario)) {
      return res.status(400).json({
        mensaje: 'El rol ingresado no es válido.'
      });
    }

    // Normaliza el correo para evitar duplicados con mayúsculas o espacios.
    const correoNormalizado = correo.trim().toLowerCase();

    const usuarioExistente = await Usuario.findOne({ correo: correoNormalizado });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: 'El correo ya está registrado.'
      });
    }

    // Encripta la contraseña antes de guardarla.
    const passwordEncriptada = await bcrypt.hash(password.trim(), 10);

    const nuevoUsuario = new Usuario({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correoNormalizado,
      password: passwordEncriptada,
      rol: rolUsuario
    });

    await nuevoUsuario.save();

    // Responde con los datos del usuario registrado, sin devolver la contraseña.
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

// Inicia sesión validando contraseña con bcrypt y generando un token JWT.
const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios.'
      });
    }

    if (!correoValido(correo.trim())) {
      return res.status(400).json({
        mensaje: 'El correo no tiene un formato válido.'
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    // Busca al usuario por correo en MongoDB.
    const usuario = await Usuario.findOne({ correo: correoNormalizado });

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    // Compara la contraseña ingresada con la contraseña encriptada.
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Contraseña incorrecta.'
      });
    }

    // Genera un token JWT con datos básicos del usuario.
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

// Obtiene todos los usuarios registrados.
const obtenerUsuarios = async (req, res) => {
  try {
    // Consulta usuarios sin mostrar la contraseña.
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

// Actualiza los datos de un usuario existente.
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, password, rol } = req.body;

    if (!nombre || !apellido || !correo || !rol) {
      return res.status(400).json({
        mensaje: 'Nombre, apellido, correo y rol son obligatorios.'
      });
    }

    if (!soloLetras(nombre.trim())) {
      return res.status(400).json({
        mensaje: 'El nombre debe contener solo letras.'
      });
    }

    if (!soloLetras(apellido.trim())) {
      return res.status(400).json({
        mensaje: 'El apellido debe contener solo letras.'
      });
    }

    if (!correoValido(correo.trim())) {
      return res.status(400).json({
        mensaje: 'El correo no tiene un formato válido.'
      });
    }

    if (!rolValido(rol)) {
      return res.status(400).json({
        mensaje: 'El rol ingresado no es válido.'
      });
    }

    if (password && password.trim() !== '' && password.trim().length < 8) {
      return res.status(400).json({
        mensaje: 'La nueva contraseña debe tener mínimo 8 caracteres.'
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    // Verifica que el correo no pertenezca a otro usuario.
    const correoExistente = await Usuario.findOne({
      correo: correoNormalizado,
      _id: { $ne: req.params.id }
    });

    if (correoExistente) {
      return res.status(400).json({
        mensaje: 'El correo ya está registrado por otro usuario.'
      });
    }

    const datosActualizados = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correoNormalizado,
      rol
    };

    // Si se envía una nueva contraseña, se encripta antes de actualizar.
    if (password && password.trim() !== '') {
      datosActualizados.password = await bcrypt.hash(password.trim(), 10);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      {
        new: true,
        runValidators: true
      }
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

// Elimina un usuario por su ID.
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

// Exporta las funciones del controlador para usarlas en las rutas.
module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
};