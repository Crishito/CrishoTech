// Interfaz que define la estructura de un usuario dentro del sistema.
export interface Usuario {
  _id?: string;
  nombre: string;
  apellido?: string;
  email: string;
  password?: string;
  rol: 'usuario' | 'admin';
}