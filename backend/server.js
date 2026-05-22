// Importamos express para crear el servidor del backend.
const express = require('express');

// Importamos mongoose para conectar el backend con MongoDB.
const mongoose = require('mongoose');

// Importamos cors para permitir que Angular se comunique con Express.
const cors = require('cors');

// Importamos dotenv para usar las variables del archivo .env.
require('dotenv').config();

// Creamos la aplicación de Express.
const app = express();

// Definimos el puerto del servidor.
const PORT = process.env.PORT || 3000;

// Activamos CORS para permitir peticiones desde Angular.
app.use(cors());

// Permitimos que Express entienda datos en formato JSON.
app.use(express.json());
const solicitudRoutes = require('./routes/solicitud.routes');
app.use('/api/solicitudes', solicitudRoutes);

// Ruta inicial para comprobar que el backend funciona.
app.get('/', (req, res) => {
  res.send('Backend de CrishoTech funcionando correctamente');
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