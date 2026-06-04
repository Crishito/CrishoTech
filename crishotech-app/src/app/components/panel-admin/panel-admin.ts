import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud.service';

@Component({
  selector: 'app-panel-admin',
  imports: [FormsModule, RouterLink, DatePipe, NgFor, NgIf],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin {

  solicitudes: Solicitud[] = [];

  solicitudSeleccionada: Solicitud | null = null;
  modalDetalleAbierto: boolean = false;

  modalEditarAbierto: boolean = false;
  idEditando: string | undefined = undefined;

  modalChatAbierto: boolean = false;
  mensajeChat: string = '';

  registroManual = {
    servicio: 'Mantenimiento / Registro Manual',
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    descripcion: '',
    estado: 'Recibido'
  };

  solicitudEditando = {
    servicio: '',
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    descripcion: '',
    estado: ''
  };

  constructor(private solicitudService: SolicitudService) {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudService.obtenerSolicitudesMongo().subscribe({
      next: (datos) => {
        this.solicitudes = datos;
      },
      error: () => {
        alert('Error al cargar solicitudes desde MongoDB.');
      }
    });
  }

  guardarRegistroManual(event: Event) {
    event.preventDefault();

    if (
      this.registroManual.servicio.trim() === '' ||
      this.registroManual.nombre.trim() === '' ||
      this.registroManual.cedula.trim() === '' ||
      this.registroManual.telefono.trim() === '' ||
      this.registroManual.correo.trim() === '' ||
      this.registroManual.direccion.trim() === '' ||
      this.registroManual.descripcion.trim() === ''
    ) {
      alert('Todos los campos del registro manual son obligatorios.');
      return;
    }

    const nuevaSolicitud: Solicitud = {
      servicio: this.registroManual.servicio,
      nombre: this.registroManual.nombre,
      cedula: this.registroManual.cedula,
      telefono: this.registroManual.telefono,
      correo: this.registroManual.correo,
      direccion: this.registroManual.direccion,
      descripcion: this.registroManual.descripcion,
      estado: this.registroManual.estado,
      fecha: new Date().toISOString(),
      chat: []
    };

    this.solicitudService.guardarSolicitudMongo(nuevaSolicitud).subscribe({
      next: () => {
        alert('Registro manual creado correctamente.');

        this.registroManual = {
          servicio: 'Mantenimiento / Registro Manual',
          nombre: '',
          cedula: '',
          telefono: '',
          correo: '',
          direccion: '',
          descripcion: '',
          estado: 'Recibido'
        };

        this.cargarSolicitudes();
      },
      error: () => {
        alert('Error al crear el registro manual.');
      }
    });
  }

  verDetalle(solicitud: Solicitud) {
    this.solicitudSeleccionada = solicitud;
    this.modalDetalleAbierto = true;
  }

  cerrarDetalle() {
    this.modalDetalleAbierto = false;
    this.solicitudSeleccionada = null;
  }

  abrirEditar(solicitud: Solicitud) {
    this.idEditando = solicitud._id;

    this.solicitudEditando = {
      servicio: solicitud.servicio,
      nombre: solicitud.nombre,
      cedula: solicitud.cedula,
      telefono: solicitud.telefono,
      correo: solicitud.correo,
      direccion: solicitud.direccion,
      descripcion: solicitud.descripcion,
      estado: solicitud.estado
    };

    this.modalEditarAbierto = true;
  }

  cerrarEditar() {
    this.modalEditarAbierto = false;
    this.idEditando = undefined;
  }

  guardarEdicion(event: Event) {
    event.preventDefault();

    if (!this.idEditando) {
      return;
    }

    if (
      this.solicitudEditando.servicio.trim() === '' ||
      this.solicitudEditando.nombre.trim() === '' ||
      this.solicitudEditando.cedula.trim() === '' ||
      this.solicitudEditando.telefono.trim() === '' ||
      this.solicitudEditando.correo.trim() === '' ||
      this.solicitudEditando.direccion.trim() === '' ||
      this.solicitudEditando.descripcion.trim() === '' ||
      this.solicitudEditando.estado.trim() === ''
    ) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    this.solicitudService.actualizarSolicitudMongo(this.idEditando, this.solicitudEditando).subscribe({
      next: () => {
        alert('Solicitud actualizada correctamente.');
        this.cerrarEditar();
        this.cargarSolicitudes();
      },
      error: () => {
        alert('Error al actualizar la solicitud.');
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
      rol: 'admin' as const,
      nombre: 'Admin Tech',
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

  cambiarEstado(id: string | undefined, nuevoEstado: string) {
    if (!id) return;

    this.solicitudService.actualizarSolicitudMongo(id, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.cargarSolicitudes();
      },
      error: () => {
        alert('Error al actualizar el estado.');
      }
    });
  }

  eliminarSolicitud(id: string | undefined) {
    if (!id) return;

    const confirmar = confirm('¿Eliminar definitivamente esta solicitud?');

    if (confirmar) {
      this.solicitudService.eliminarSolicitudMongo(id).subscribe({
        next: () => {
          alert('Solicitud eliminada correctamente.');
          this.cargarSolicitudes();
        },
        error: () => {
          alert('Error al eliminar la solicitud.');
        }
      });
    }
  }
}