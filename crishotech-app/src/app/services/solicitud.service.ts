// Importaciones necesarias para el servicio de solicitudes.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Solicitud, MensajeChat } from '../models/solicitud';

// Configuración del servicio para que esté disponible en toda la aplicación.
@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  // Ruta del backend para trabajar con solicitudes en MongoDB.
  private apiUrl = 'http://localhost:3000/api/solicitudes';

  // Arreglo temporal donde se guardan las solicitudes antes de confirmarlas.
  private carrito: Solicitud[] = [];

  // Inyecta HttpClient para comunicarse con el backend.
  constructor(private http: HttpClient) {}

  // Agrega una solicitud al carrito temporal.
  agregarAlCarrito(solicitud: Solicitud) {
    this.carrito.push(solicitud);
  }

  // Agrega un mensaje al chat de una solicitud específica.
  agregarMensajeChat(id: string, mensaje: MensajeChat): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/chat`, mensaje);
}

  // Obtiene las solicitudes guardadas en el carrito.
  obtenerCarrito(): Solicitud[] {
    return this.carrito;
  }

  // Elimina una solicitud del carrito usando su ID temporal.
  eliminarDelCarrito(id: number) {
    this.carrito = this.carrito.filter(solicitud => solicitud.id !== id);
  }

  // Vacía completamente el carrito.
  vaciarCarrito() {
    this.carrito = [];
  }

  // Guarda una solicitud en MongoDB mediante el backend.
  guardarSolicitudMongo(solicitud: Solicitud): Observable<any> {
    return this.http.post(this.apiUrl, solicitud);
  }

  // Obtiene todas las solicitudes registradas en MongoDB.
  obtenerSolicitudesMongo(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl);
  }

  // Actualiza una solicitud existente en MongoDB.
  actualizarSolicitudMongo(id: string, datos: Partial<Solicitud>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  // Elimina una solicitud de MongoDB.
  eliminarSolicitudMongo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Convierte las solicitudes del carrito en peticiones para guardarlas en MongoDB.
  confirmarPedido(): Observable<any>[] {
    const peticiones = this.carrito.map(solicitud => {
      return this.guardarSolicitudMongo(solicitud);
    });

    return peticiones;
  }
}