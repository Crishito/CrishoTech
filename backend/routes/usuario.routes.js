const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios
} = require('../controllers/usuario.controller');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/', obtenerUsuarios);

module.exports = router;