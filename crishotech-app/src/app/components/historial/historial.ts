import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-historial',
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial {

  solicitudes: Solicitud[] = [];

  solicitudSeleccionada: Solicitud | null = null;
  modalChatAbierto: boolean = false;
  mensajeChat: string = '';

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {
    this.cargarHistorial();
  }

  cargarHistorial() {
    const usuarioActual = this.authService.usuarioActual();

    if (!usuarioActual) {
      this.solicitudes = [];
      return;
    }

    this.solicitudService.obtenerSolicitudesMongo().subscribe({
      next: (datos) => {

        // SOLO MUESTRA LAS SOLICITUDES DEL USUARIO LOGUEADO
        this.solicitudes = datos.filter(item => item.usuarioEmail === usuarioActual.email);

      },
      error: () => {
        alert('Error al cargar el historial desde MongoDB.');
      }
    });
  }

  abrirChat(solicitud: Solicitud) {
    this.solicitudSeleccionada = solicitud;
    this.modalChatAbierto = true;
  }

  cerrarChat() {
    this.modalChatAbierto = false;
    this.mensajeChat = '';
    this.solicitudSeleccionada = null;
  }

  enviarMensajeChat(event: Event) {
    event.preventDefault();

    if (!this.solicitudSeleccionada?._id) {
      return;
    }

    if (this.mensajeChat.trim() === '') {
      alert('Escribe un mensaje antes de enviar.');
      return;
    }

    const nuevoMensaje = {
      rol: 'usuario' as const,
      nombre: this.solicitudSeleccionada.nombre,
      mensaje: this.mensajeChat,
      fecha: new Date().toISOString()
    };

    const chatActual = this.solicitudSeleccionada.chat || [];

    const solicitudActualizada = {
      chat: [...chatActual, nuevoMensaje]
    };

    this.solicitudService.actualizarSolicitudMongo(this.solicitudSeleccionada._id, solicitudActualizada).subscribe({
      next: () => {
        const idSolicitud = this.solicitudSeleccionada?._id;
        const usuarioActual = this.authService.usuarioActual();

        this.mensajeChat = '';

        this.solicitudService.obtenerSolicitudesMongo().subscribe({
          next: (datos) => {

            if (!usuarioActual) {
              this.solicitudes = [];
              return;
            }

            // VUELVE A FILTRAR PARA QUE SOLO SE MUESTREN LAS SOLICITUDES DEL USUARIO ACTUAL
            this.solicitudes = datos.filter(item => item.usuarioEmail === usuarioActual.email);

            const solicitudActual = this.solicitudes.find(item => item._id === idSolicitud);

            if (solicitudActual) {
              this.solicitudSeleccionada = solicitudActual;
            }
          }
        });
      },
      error: () => {
        alert('Error al enviar el mensaje.');
      }
    });
  }

  eliminarSolicitud(id: string | undefined) {
    if (!id) return;

    const confirmar = confirm('¿Estás seguro de eliminar esta solicitud del historial?');

    if (!confirmar) {
      return;
    }

    this.solicitudService.eliminarSolicitudMongo(id).subscribe({
      next: () => {
        alert('Solicitud eliminada correctamente.');
        this.cargarHistorial();
      },
      error: () => {
        alert('Error al eliminar la solicitud.');
      }
    });
  }
}