import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Ruta del backend para trabajar con usuarios en MongoDB.
  private apiUrl = 'http://localhost:3000/api/usuarios';

  // Guardamos el usuario actual en una signal para que el header cambie automáticamente.
  usuarioActual = signal<Usuario | null>(this.obtenerUsuarioGuardado());

  // Inyectamos HttpClient para poder comunicarnos con el backend.
  constructor(private http: HttpClient) {}

  // Recupera el usuario guardado en localStorage si ya inició sesión antes.
  private obtenerUsuarioGuardado(): Usuario | null {
    const usuario = localStorage.getItem('usuarioActual');

    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario);
  }

  // Registra usuarios en MongoDB.
  registrar(usuario: Usuario): Observable<any> {
    const datosParaBackend = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.email,
      password: usuario.password,
      rol: usuario.rol
    };

    return this.http.post(`${this.apiUrl}/registro`, datosParaBackend);
  }

  // Inicia sesión consultando el backend y MongoDB.
  login(email: string, password: string): Observable<boolean> {
    const datosLogin = {
      correo: email,
      password: password
    };

    return this.http.post<any>(`${this.apiUrl}/login`, datosLogin).pipe(
      tap(respuesta => {
        const usuarioBackend = respuesta.usuario;

        const usuarioSesion: Usuario = {
          _id: usuarioBackend._id,
          nombre: usuarioBackend.nombre,
          apellido: usuarioBackend.apellido,
          email: usuarioBackend.correo,
          rol: usuarioBackend.rol
        };

        this.guardarSesion(usuarioSesion);
      }),
      map(() => true)
    );
  }

  // Guarda la sesión del usuario en localStorage.
  guardarSesion(usuario: Usuario) {
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    this.usuarioActual.set(usuario);
  }

  // Cierra sesión eliminando el usuario guardado.
  cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    this.usuarioActual.set(null);
  }

  // Verifica si existe una sesión activa.
  estaLogueado(): boolean {
    return this.usuarioActual() !== null;
  }

  // Verifica si el usuario actual es administrador.
  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  // Verifica si el usuario actual es cliente.
  esUsuario(): boolean {
    return this.usuarioActual()?.rol === 'usuario';
  }
}