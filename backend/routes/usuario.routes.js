// Importaciones necesarias para crear las rutas de usuarios.
const express = require('express');
const router = express.Router();

// Importación de funciones del controlador de usuarios.
const {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuario.controller');

// Ruta para registrar un nuevo usuario.
router.post('/registro', registrarUsuario);

// Ruta para iniciar sesión.
router.post('/login', loginUsuario);

// Ruta para obtener todos los usuarios registrados.
router.get('/', obtenerUsuarios);

// Ruta para actualizar un usuario por su ID.
router.put('/:id', actualizarUsuario);

// Ruta para eliminar un usuario por su ID.
router.delete('/:id', eliminarUsuario);

// Exporta las rutas para usarlas en el servidor principal.
module.exports = router;