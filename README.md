```markdown
# CrishoTech

CrishoTech es una aplicación web desarrollada con Angular, Node.js, Express y MongoDB,
orientada a la gestión de servicios técnicos informáticos. El sistema permite registrar
usuarios, iniciar sesión, solicitar servicios, administrar solicitudes, gestionar usuarios
y dar seguimiento mediante un chat entre cliente y administrador.

## Tecnologías utilizadas

- Angular
- Node.js
- Express.js
- MongoDB
- Mongoose
- TypeScript
- JavaScript
- HTML
- CSS
- Bootstrap / Tailwind CSS
- JWT
- Bcryptjs

## Funcionalidades principales

- Registro de usuarios.
- Inicio de sesión.
- Control de roles: usuario y administrador.
- Visualización de servicios técnicos.
- Agregar solicitudes al carrito.
- Confirmación de pedidos.
- Historial de solicitudes por usuario.
- Panel administrativo.
- Gestión de usuarios.
- Gestión de solicitudes.
- Cambio de estado de solicitudes.
- Chat de seguimiento entre cliente y administrador.
- Exportación de solicitudes a Excel.
- Conexión con MongoDB.
- Validación de formularios.
- Protección de rutas mediante guards.

## Estructura general del proyecto

El proyecto está dividido en dos partes principales:

### Frontend

Desarrollado en Angular. Contiene los componentes visuales, rutas, servicios, modelos y guards.

Componentes principales:

- Inicio
- Header
- Footer
- Login
- Registro
- Servicios
- Carrito
- Historial
- Panel administrativo

### Backend

Desarrollado con Node.js y Express. Se encarga de recibir las peticiones del frontend, conectarse con MongoDB y gestionar la información del sistema.

Archivos principales:

- server.js
- usuario.controller.js
- usuario.routes.js
- solicitud.routes.js
- usuario.model.js
- solicitud.model.js

## Base de datos

La aplicación utiliza MongoDB como base de datos principal. En ella se almacenan:

- Usuarios registrados.
- Solicitudes de servicios.
- Estados de las solicitudes.
- Mensajes del chat.
- Información de contacto del cliente.

## Seguridad

El sistema implementa medidas básicas de seguridad como:

- Encriptación de contraseñas con bcryptjs.
- Generación de tokens JWT para el inicio de sesión.
- Control de acceso según el rol del usuario.
- Protección de rutas para usuarios y administradores.
- Validaciones en frontend y backend.

## Autor

Christian Zumárraga

## Proyecto académico
