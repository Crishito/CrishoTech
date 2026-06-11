// Importamos express para crear el servidor del backend.
const express = require('express');

// Importamos mongoose para conectar el backend con MongoDB.
const mongoose = require('mongoose');

// Importamos cors para permitir que Angular se comunique con Express.
const cors = require('cors');

// Importamos dotenv para usar las variables del archivo .env.
require('dotenv').config();

// Importamos las rutas de solicitudes.
const solicitudRoutes = require('./routes/solicitud.routes');

// Importamos las rutas de usuarios.
const usuarioRoutes = require('./routes/usuario.routes');

// Creamos la aplicación de Express.
const app = express();

// Definimos el puerto del servidor.
const PORT = process.env.PORT || 3000;
// Activamos CORS para permitir peticiones desde Angular.

app.use(cors());
// Permitimos que Express entienda datos en formato JSON.

app.use(express.json());
// Ruta inicial para comprobar que el backend funciona.

app.get('/', (req, res) => {
  res.send('Backend de CrishoTech funcionando correctamente');
});

// Conectamos las rutas de solicitudes.
app.use('/api/solicitudes', solicitudRoutes);

// Conectamos las rutas de usuarios.
app.use('/api/usuarios', usuarioRoutes);

// Mensaje de prueba para saber si este server.js está cargando las rutas de usuarios.
console.log('RUTA DE USUARIOS CARGADA');

// Ruta de prueba directa para verificar usuarios.
app.get('/api/prueba-usuarios', (req, res) => {
  res.json({
    mensaje: 'Ruta de usuarios funcionando'
  });
});

// Conectamos con MongoDB.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado correctamente a MongoDB');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error);
  });