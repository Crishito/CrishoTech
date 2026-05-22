import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Solicitud, MensajeChat } from '../models/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = 'http://localhost:3000/api/solicitudes';

  private carrito: Solicitud[] = [];

  constructor(private http: HttpClient) {}

  agregarAlCarrito(solicitud: Solicitud) {
    this.carrito.push(solicitud);
  }
  agregarMensajeChat(id: string, mensaje: MensajeChat): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/chat`, mensaje);
}
  obtenerCarrito(): Solicitud[] {
    return this.carrito;
  }

  eliminarDelCarrito(id: number) {
    this.carrito = this.carrito.filter(solicitud => solicitud.id !== id);
  }

  vaciarCarrito() {
    this.carrito = [];
  }

  guardarSolicitudMongo(solicitud: Solicitud): Observable<any> {
    return this.http.post(this.apiUrl, solicitud);
  }

  obtenerSolicitudesMongo(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl);
  }

  actualizarSolicitudMongo(id: string, datos: Partial<Solicitud>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  eliminarSolicitudMongo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  confirmarPedido(): Observable<any>[] {
    const peticiones = this.carrito.map(solicitud => {
      return this.guardarSolicitudMongo(solicitud);
    });

    return peticiones;
  }
}