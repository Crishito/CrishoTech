// Interfaz que define la estructura de cada mensaje del chat.
export interface MensajeChat {
  rol: 'usuario' | 'admin';
  nombre: string;
  mensaje: string;
  fecha?: string;
}

// Interfaz que define la estructura de una solicitud de servicio.
export interface Solicitud {
  _id?: string;
  id?: number;
  servicio: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  descripcion: string;
  estado: string;
  fecha?: string;
  chat?: MensajeChat[];

  // Correo del usuario que creó la solicitud.
  usuarioEmail?: string;
}