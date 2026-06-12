// Importaciones principales de Angular.
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

// Importación del modelo y servicios necesarios.
import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../services/auth.service';

// Configuración del componente Historial.
@Component({
  selector: 'app-historial',
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './historial.html',
})
export class Historial {

  // Lista de solicitudes del usuario.
  solicitudes: Solicitud[] = [];

  // Variables para controlar el chat.
  solicitudSeleccionada: Solicitud | null = null;
  modalChatAbierto: boolean = false;
  mensajeChat: string = '';

  // Mensajes visuales para el usuario.
  mensajeExitoHistorial: string = '';
  mensajeErrorHistorial: string = '';
  mensajeAvisoHistorial: string = '';
  errorChat: string = '';

  // Variables para confirmar eliminación.
  modalConfirmacionAbierto: boolean = false;
  idSolicitudEliminar: string | undefined = undefined;

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {
    this.cargarHistorial();
  }

  // Limpia los mensajes mostrados en pantalla.
  limpiarMensajes() {
    this.mensajeExitoHistorial = '';
    this.mensajeErrorHistorial = '';
    this.mensajeAvisoHistorial = '';
  }

  // Carga las solicitudes desde MongoDB y muestra solo las del usuario logueado.
  cargarHistorial() {
    const usuarioActual = this.authService.usuarioActual();

    if (!usuarioActual) {
      this.solicitudes = [];
      return;
    }

    this.solicitudService.obtenerSolicitudesMongo().subscribe({
      next: (datos) => {

        // Filtra las solicitudes del usuario actual.
        this.solicitudes = datos.filter(item => item.usuarioEmail === usuarioActual.email);

      },
      error: () => {
        this.mensajeErrorHistorial = 'Error al cargar el historial desde MongoDB.';
      }
    });
  }

  // Abre el modal de chat de una solicitud.
  abrirChat(solicitud: Solicitud) {
    this.solicitudSeleccionada = solicitud;
    this.errorChat = '';
    this.modalChatAbierto = true;
  }

  // Cierra el modal de chat.
  cerrarChat() {
    this.modalChatAbierto = false;
    this.mensajeChat = '';
    this.errorChat = '';
    this.solicitudSeleccionada = null;
  }

  // Envía un mensaje al chat de la solicitud.
  enviarMensajeChat(event: Event) {
    event.preventDefault();

    this.errorChat = '';

    if (!this.solicitudSeleccionada?._id) {
      return;
    }

    if (this.mensajeChat.trim() === '') {
      this.errorChat = 'Escribe un mensaje antes de enviar.';
      return;
    }

    const nuevoMensaje = {
      rol: 'usuario' as const,
      nombre: this.solicitudSeleccionada.nombre,
      mensaje: this.mensajeChat.trim(),
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

            // Actualiza el historial después de enviar el mensaje.
            this.solicitudes = datos.filter(item => item.usuarioEmail === usuarioActual.email);

            const solicitudActual = this.solicitudes.find(item => item._id === idSolicitud);

            if (solicitudActual) {
              this.solicitudSeleccionada = solicitudActual;
            }
          },
          error: () => {
            this.errorChat = 'Error al actualizar el chat.';
          }
        });
      },
      error: () => {
        this.errorChat = 'Error al enviar el mensaje.';
      }
    });
  }

  // Abre el modal para confirmar la eliminación.
  eliminarSolicitud(id: string | undefined) {
    this.limpiarMensajes();

    if (!id) {
      this.mensajeErrorHistorial = 'No se pudo identificar la solicitud.';
      return;
    }

    this.idSolicitudEliminar = id;
    this.modalConfirmacionAbierto = true;
  }

  // Cierra el modal de confirmación.
  cerrarConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.idSolicitudEliminar = undefined;
  }

  // Elimina la solicitud seleccionada desde MongoDB.
  confirmarEliminacion() {
    this.limpiarMensajes();

    if (!this.idSolicitudEliminar) {
      this.mensajeErrorHistorial = 'No se pudo procesar la eliminación.';
      this.cerrarConfirmacion();
      return;
    }

    this.solicitudService.eliminarSolicitudMongo(this.idSolicitudEliminar).subscribe({
      next: () => {
        this.mensajeExitoHistorial = 'Solicitud eliminada correctamente.';
        this.cargarHistorial();
        this.cerrarConfirmacion();
      },
      error: () => {
        this.mensajeErrorHistorial = 'Error al eliminar la solicitud.';
        this.cerrarConfirmacion();
      }
    });
  }
}