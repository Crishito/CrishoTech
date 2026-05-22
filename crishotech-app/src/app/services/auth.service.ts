import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  usuarioActual = signal<Usuario | null>(this.obtenerUsuarioGuardado());

  private obtenerUsuarioGuardado(): Usuario | null {
    const usuario = localStorage.getItem('usuarioActual');

    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario);
  }

  registrar(usuario: Usuario): boolean {
    const usuarios = this.obtenerUsuariosRegistrados();

    const existe = usuarios.some(item => item.email === usuario.email);

    if (existe) {
      return false;
    }

    usuarios.push(usuario);

    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));

    return true;
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@crishotech.com' && password === 'CrishoTech@2026') {
      const admin: Usuario = {
        nombre: 'Admin Tech',
        email: 'admin@crishotech.com',
        rol: 'admin'
      };

      this.guardarSesion(admin);
      return true;
    }

    const usuarios = this.obtenerUsuariosRegistrados();

    const usuario = usuarios.find(item => item.email === email && item.password === password);

    if (!usuario) {
      return false;
    }

    const usuarioSesion: Usuario = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: 'usuario'
    };

    this.guardarSesion(usuarioSesion);

    return true;
  }

  guardarSesion(usuario: Usuario) {
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    this.usuarioActual.set(usuario);
  }

  cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    this.usuarioActual.set(null);
  }

  obtenerUsuariosRegistrados(): Usuario[] {
    const usuarios = localStorage.getItem('usuariosRegistrados');

    if (!usuarios) {
      return [];
    }

    return JSON.parse(usuarios);
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null;
  }

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  esUsuario(): boolean {
    return this.usuarioActual()?.rol === 'usuario';
  }
}