import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud.service';

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

  constructor(private solicitudService: SolicitudService) {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.solicitudService.obtenerSolicitudesMongo().subscribe({
      next: (datos) => {
        this.solicitudes = datos;
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

        this.mensajeChat = '';

        this.solicitudService.obtenerSolicitudesMongo().subscribe({
          next: (datos) => {
            this.solicitudes = datos;

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