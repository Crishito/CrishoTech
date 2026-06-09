import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { Solicitud } from '../../models/solicitud';
import { Usuario } from '../../models/usuario';

import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-panel-admin',
  imports: [FormsModule, RouterLink, DatePipe, NgFor, NgIf],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin {

  solicitudes: Solicitud[] = [];
  usuarios: Usuario[] = [];

  solicitudSeleccionada: Solicitud | null = null;
  modalDetalleAbierto: boolean = false;

  modalEditarAbierto: boolean = false;
  idEditando: string | undefined = undefined;

  modalChatAbierto: boolean = false;
  mensajeChat: string = '';

  modalEditarUsuarioAbierto: boolean = false;
  idUsuarioEditando: string | undefined = undefined;
  mostrarPasswordUsuario: boolean = false;

  private logoExcelUrl = '/img/logo.png';

  mensajeExitoPanel: string = '';
  mensajeErrorPanel: string = '';

  mensajeRegistroManual: string = '';

  modalConfirmacionAbierto: boolean = false;
  tituloConfirmacion: string = '';
  mensajeConfirmacion: string = '';
  tipoConfirmacion: 'solicitud' | 'usuario' | '' = '';
  idConfirmacion: string | undefined = undefined;

  erroresRegistroManual = {
    servicio: '',
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    descripcion: '',
    general: ''
  };

  erroresSolicitudEditando = {
    servicio: '',
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    descripcion: '',
    estado: '',
    general: ''
  };

  erroresUsuarioEditando = {
    nombre: '',
    apellido: '',
    email: '',
    rol: '',
    general: ''
  };

  errorChat: string = '';

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

  usuarioEditando: Usuario = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario'
  };

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {
    this.cargarSolicitudes();
    this.cargarUsuarios();
  }

  private limpiarMensajesGenerales() {
    this.mensajeExitoPanel = '';
    this.mensajeErrorPanel = '';
  }

  private limpiarErroresRegistroManual() {
    this.erroresRegistroManual = {
      servicio: '',
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: '',
      descripcion: '',
      general: ''
    };

    this.mensajeRegistroManual = '';
  }

  private limpiarErroresSolicitudEditando() {
    this.erroresSolicitudEditando = {
      servicio: '',
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: '',
      descripcion: '',
      estado: '',
      general: ''
    };
  }

  private limpiarErroresUsuarioEditando() {
    this.erroresUsuarioEditando = {
      nombre: '',
      apellido: '',
      email: '',
      rol: '',
      general: ''
    };
  }

  private correoValido(correo: string): boolean {
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresion.test(correo);
  }

  private soloLetras(texto: string): boolean {
    const expresion = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
    return expresion.test(texto);
  }

  limpiarNombreRegistroManual() {
    this.registroManual.nombre = this.registroManual.nombre.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
    this.erroresRegistroManual.nombre = '';
  }

  limpiarNombreSolicitudEditando() {
    this.solicitudEditando.nombre = this.solicitudEditando.nombre.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
    this.erroresSolicitudEditando.nombre = '';
  }

  limpiarNombreUsuarioEditando() {
    this.usuarioEditando.nombre = this.usuarioEditando.nombre.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
    this.erroresUsuarioEditando.nombre = '';
  }

  limpiarApellidoUsuarioEditando() {
    this.usuarioEditando.apellido = this.usuarioEditando.apellido?.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '') || '';
    this.erroresUsuarioEditando.apellido = '';
  }

  cargarSolicitudes() {
    this.solicitudService.obtenerSolicitudesMongo().subscribe({
      next: (datos) => {
        this.solicitudes = datos;
      },
      error: () => {
        this.mensajeErrorPanel = 'Error al cargar solicitudes desde MongoDB.';
      }
    });
  }

  cargarUsuarios() {
    this.authService.obtenerUsuarios().subscribe({
      next: (datos) => {
        this.usuarios = datos.map((item: any) => {
          return {
            _id: item._id,
            nombre: item.nombre,
            apellido: item.apellido,
            email: item.correo || item.email,
            rol: item.rol
          };
        });
      },
      error: () => {
        this.mensajeErrorPanel = 'Error al cargar usuarios desde MongoDB.';
      }
    });
  }

  validarRegistroManual(): boolean {
    this.limpiarErroresRegistroManual();

    let valido = true;

    if (this.registroManual.nombre.trim() === '') {
      this.erroresRegistroManual.nombre = 'El nombre completo es obligatorio.';
      valido = false;
    } else if (!this.soloLetras(this.registroManual.nombre.trim())) {
      this.erroresRegistroManual.nombre = 'El nombre debe contener solo letras.';
      valido = false;
    }

    if (this.registroManual.cedula.trim() === '') {
      this.erroresRegistroManual.cedula = 'La cédula es obligatoria.';
      valido = false;
    } else if (!/^\d{10}$/.test(this.registroManual.cedula)) {
      this.erroresRegistroManual.cedula = 'La cédula debe tener 10 números.';
      valido = false;
    }

    if (this.registroManual.telefono.trim() === '') {
      this.erroresRegistroManual.telefono = 'El teléfono es obligatorio.';
      valido = false;
    } else if (!/^\d{10}$/.test(this.registroManual.telefono)) {
      this.erroresRegistroManual.telefono = 'El teléfono debe tener 10 números.';
      valido = false;
    }

    if (this.registroManual.correo.trim() === '') {
      this.erroresRegistroManual.correo = 'El correo es obligatorio.';
      valido = false;
    } else if (!this.correoValido(this.registroManual.correo)) {
      this.erroresRegistroManual.correo = 'El correo debe tener un formato correcto.';
      valido = false;
    }

    if (this.registroManual.direccion.trim() === '') {
      this.erroresRegistroManual.direccion = 'La dirección es obligatoria.';
      valido = false;
    }

    if (this.registroManual.servicio.trim() === '') {
      this.erroresRegistroManual.servicio = 'El servicio es obligatorio.';
      valido = false;
    }

    if (this.registroManual.descripcion.trim() === '') {
      this.erroresRegistroManual.descripcion = 'La descripción es obligatoria.';
      valido = false;
    }

    return valido;
  }

  guardarRegistroManual(event: Event) {
    event.preventDefault();
    this.limpiarMensajesGenerales();

    if (!this.validarRegistroManual()) {
      return;
    }

    const nuevaSolicitud: Solicitud = {
      servicio: this.registroManual.servicio.trim(),
      nombre: this.registroManual.nombre.trim(),
      cedula: this.registroManual.cedula.trim(),
      telefono: this.registroManual.telefono.trim(),
      correo: this.registroManual.correo.trim(),
      direccion: this.registroManual.direccion.trim(),
      descripcion: this.registroManual.descripcion.trim(),
      estado: this.registroManual.estado,
      fecha: new Date().toISOString(),
      chat: []
    };

    this.solicitudService.guardarSolicitudMongo(nuevaSolicitud).subscribe({
      next: () => {
        this.mensajeRegistroManual = 'Registro manual creado correctamente.';

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
      error: (error) => {
        this.erroresRegistroManual.general =
          error.error?.mensaje || 'Error al crear el registro manual.';
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
    this.limpiarErroresSolicitudEditando();

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
    this.limpiarErroresSolicitudEditando();
  }

  validarSolicitudEditando(): boolean {
    this.limpiarErroresSolicitudEditando();

    let valido = true;

    if (this.solicitudEditando.servicio.trim() === '') {
      this.erroresSolicitudEditando.servicio = 'El servicio es obligatorio.';
      valido = false;
    }

    if (this.solicitudEditando.nombre.trim() === '') {
      this.erroresSolicitudEditando.nombre = 'El nombre completo es obligatorio.';
      valido = false;
    } else if (!this.soloLetras(this.solicitudEditando.nombre.trim())) {
      this.erroresSolicitudEditando.nombre = 'El nombre debe contener solo letras.';
      valido = false;
    }

    if (this.solicitudEditando.cedula.trim() === '') {
      this.erroresSolicitudEditando.cedula = 'La cédula es obligatoria.';
      valido = false;
    } else if (!/^\d{10}$/.test(this.solicitudEditando.cedula)) {
      this.erroresSolicitudEditando.cedula = 'La cédula debe tener 10 números.';
      valido = false;
    }

    if (this.solicitudEditando.telefono.trim() === '') {
      this.erroresSolicitudEditando.telefono = 'El teléfono es obligatorio.';
      valido = false;
    } else if (!/^\d{10}$/.test(this.solicitudEditando.telefono)) {
      this.erroresSolicitudEditando.telefono = 'El teléfono debe tener 10 números.';
      valido = false;
    }

    if (this.solicitudEditando.correo.trim() === '') {
      this.erroresSolicitudEditando.correo = 'El correo es obligatorio.';
      valido = false;
    } else if (!this.correoValido(this.solicitudEditando.correo)) {
      this.erroresSolicitudEditando.correo = 'El correo debe tener un formato correcto.';
      valido = false;
    }

    if (this.solicitudEditando.direccion.trim() === '') {
      this.erroresSolicitudEditando.direccion = 'La dirección es obligatoria.';
      valido = false;
    }

    if (this.solicitudEditando.descripcion.trim() === '') {
      this.erroresSolicitudEditando.descripcion = 'La descripción es obligatoria.';
      valido = false;
    }

    if (this.solicitudEditando.estado.trim() === '') {
      this.erroresSolicitudEditando.estado = 'El estado es obligatorio.';
      valido = false;
    }

    return valido;
  }

  guardarEdicion(event: Event) {
    event.preventDefault();
    this.limpiarMensajesGenerales();

    if (!this.idEditando) {
      return;
    }

    if (!this.validarSolicitudEditando()) {
      return;
    }

    this.solicitudService.actualizarSolicitudMongo(this.idEditando, this.solicitudEditando).subscribe({
      next: () => {
        this.mensajeExitoPanel = 'Solicitud actualizada correctamente.';
        this.cerrarEditar();
        this.cargarSolicitudes();
      },
      error: (error) => {
        this.erroresSolicitudEditando.general =
          error.error?.mensaje || 'Error al actualizar la solicitud.';
      }
    });
  }

  abrirChat(solicitud: Solicitud) {
    this.solicitudSeleccionada = solicitud;
    this.errorChat = '';
    this.modalChatAbierto = true;
  }

  cerrarChat() {
    this.modalChatAbierto = false;
    this.mensajeChat = '';
    this.errorChat = '';
    this.solicitudSeleccionada = null;
  }

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
      rol: 'admin' as const,
      nombre: 'Admin Tech',
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
      error: (error) => {
        this.errorChat = error.error?.mensaje || 'Error al enviar el mensaje.';
      }
    });
  }

  cambiarEstado(id: string | undefined, nuevoEstado: string) {
    if (!id) return;

    this.limpiarMensajesGenerales();

    this.solicitudService.actualizarSolicitudMongo(id, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.mensajeExitoPanel = 'Estado actualizado correctamente.';
        this.cargarSolicitudes();
      },
      error: (error) => {
        this.mensajeErrorPanel = error.error?.mensaje || 'Error al actualizar el estado.';
      }
    });
  }

  eliminarSolicitud(id: string | undefined) {
    this.limpiarMensajesGenerales();

    if (!id) {
      this.mensajeErrorPanel = 'No se pudo identificar la solicitud.';
      return;
    }

    this.idConfirmacion = id;
    this.tipoConfirmacion = 'solicitud';
    this.tituloConfirmacion = 'Eliminar solicitud';
    this.mensajeConfirmacion = '¿Seguro que deseas eliminar definitivamente esta solicitud?';
    this.modalConfirmacionAbierto = true;
  }

  abrirEditarUsuario(usuario: Usuario) {
    this.idUsuarioEditando = usuario._id;
    this.mostrarPasswordUsuario = false;
    this.limpiarErroresUsuarioEditando();

    this.usuarioEditando = {
      _id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      email: usuario.email,
      password: '',
      rol: usuario.rol
    };

    this.modalEditarUsuarioAbierto = true;
  }

  cerrarEditarUsuario() {
    this.modalEditarUsuarioAbierto = false;
    this.idUsuarioEditando = undefined;
    this.mostrarPasswordUsuario = false;
    this.limpiarErroresUsuarioEditando();

    this.usuarioEditando = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'usuario'
    };
  }

  alternarPasswordUsuario() {
    this.mostrarPasswordUsuario = !this.mostrarPasswordUsuario;
  }

  validarUsuarioEditando(): boolean {
    this.limpiarErroresUsuarioEditando();

    let valido = true;

    if (this.usuarioEditando.nombre.trim() === '') {
      this.erroresUsuarioEditando.nombre = 'El nombre es obligatorio.';
      valido = false;
    } else if (!this.soloLetras(this.usuarioEditando.nombre.trim())) {
      this.erroresUsuarioEditando.nombre = 'El nombre debe contener solo letras.';
      valido = false;
    }

    if (!this.usuarioEditando.apellido || this.usuarioEditando.apellido.trim() === '') {
      this.erroresUsuarioEditando.apellido = 'El apellido es obligatorio.';
      valido = false;
    } else if (!this.soloLetras(this.usuarioEditando.apellido.trim())) {
      this.erroresUsuarioEditando.apellido = 'El apellido debe contener solo letras.';
      valido = false;
    }

    if (this.usuarioEditando.email.trim() === '') {
      this.erroresUsuarioEditando.email = 'El correo es obligatorio.';
      valido = false;
    } else if (!this.correoValido(this.usuarioEditando.email)) {
      this.erroresUsuarioEditando.email = 'El correo debe tener un formato correcto.';
      valido = false;
    }

    if (!this.usuarioEditando.rol || this.usuarioEditando.rol.trim() === '') {
      this.erroresUsuarioEditando.rol = 'El rol es obligatorio.';
      valido = false;
    }

    return valido;
  }

  guardarEdicionUsuario(event: Event) {
    event.preventDefault();
    this.limpiarMensajesGenerales();

    if (!this.idUsuarioEditando) {
      return;
    }

    if (!this.validarUsuarioEditando()) {
      return;
    }

    this.authService.actualizarUsuario(this.idUsuarioEditando, this.usuarioEditando).subscribe({
      next: () => {
        this.mensajeExitoPanel = 'Usuario actualizado correctamente.';
        this.cerrarEditarUsuario();
        this.cargarUsuarios();
      },
      error: (error) => {
        this.erroresUsuarioEditando.general =
          error.error?.mensaje || 'Error al actualizar usuario.';
      }
    });
  }

  eliminarUsuario(id: string | undefined) {
    this.limpiarMensajesGenerales();

    if (!id) {
      this.mensajeErrorPanel = 'No se pudo identificar el usuario.';
      return;
    }

    const usuarioActual = this.authService.usuarioActual();

    if (usuarioActual?._id === id) {
      this.mensajeErrorPanel = 'No puedes eliminar tu propia cuenta mientras estás logueado.';
      return;
    }

    this.idConfirmacion = id;
    this.tipoConfirmacion = 'usuario';
    this.tituloConfirmacion = 'Eliminar usuario';
    this.mensajeConfirmacion = '¿Seguro que deseas eliminar definitivamente este usuario?';
    this.modalConfirmacionAbierto = true;
  }

  cerrarConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.tituloConfirmacion = '';
    this.mensajeConfirmacion = '';
    this.tipoConfirmacion = '';
    this.idConfirmacion = undefined;
  }

  confirmarEliminacion() {
    this.limpiarMensajesGenerales();

    if (!this.idConfirmacion || !this.tipoConfirmacion) {
      this.mensajeErrorPanel = 'No se pudo procesar la eliminación.';
      this.cerrarConfirmacion();
      return;
    }

    if (this.tipoConfirmacion === 'solicitud') {
      this.solicitudService.eliminarSolicitudMongo(this.idConfirmacion).subscribe({
        next: () => {
          this.mensajeExitoPanel = 'Solicitud eliminada correctamente.';
          this.cargarSolicitudes();
          this.cerrarConfirmacion();
        },
        error: (error) => {
          this.mensajeErrorPanel = error.error?.mensaje || 'Error al eliminar la solicitud.';
          this.cerrarConfirmacion();
        }
      });
    }

    if (this.tipoConfirmacion === 'usuario') {
      this.authService.eliminarUsuario(this.idConfirmacion).subscribe({
        next: () => {
          this.mensajeExitoPanel = 'Usuario eliminado correctamente.';
          this.cargarUsuarios();
          this.cerrarConfirmacion();
        },
        error: (error) => {
          this.mensajeErrorPanel = error.error?.mensaje || 'Error al eliminar usuario.';
          this.cerrarConfirmacion();
        }
      });
    }
  }

  private convertirBlobABase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onloadend = () => {
        resolve(lector.result as string);
      };

      lector.onerror = reject;

      lector.readAsDataURL(blob);
    });
  }

  private async obtenerLogoBase64(): Promise<string | null> {
    try {
      const respuesta = await fetch(this.logoExcelUrl);

      if (!respuesta.ok) {
        return null;
      }

      const blob = await respuesta.blob();
      return await this.convertirBlobABase64(blob);

    } catch {
      return null;
    }
  }

  async exportarSolicitudesExcel() {
    this.limpiarMensajesGenerales();

    if (this.solicitudes.length === 0) {
      this.mensajeErrorPanel = 'No hay solicitudes para exportar.';
      return;
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'CrishoTech';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Solicitudes', {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      }
    });

    worksheet.views = [
      {
        state: 'frozen',
        ySplit: 8
      }
    ];

    worksheet.columns = [
      { key: 'nro', width: 8 },
      { key: 'cliente', width: 28 },
      { key: 'cedula', width: 16 },
      { key: 'telefono', width: 16 },
      { key: 'correo', width: 32 },
      { key: 'direccion', width: 35 },
      { key: 'servicio', width: 32 },
      { key: 'descripcion', width: 45 },
      { key: 'estado', width: 18 },
      { key: 'fecha', width: 24 }
    ];

    worksheet.mergeCells('A1:J3');

    const celdaTitulo = worksheet.getCell('A1');
    celdaTitulo.value = 'CRISHOTECH\nREPORTE DE SOLICITUDES TÉCNICAS';
    celdaTitulo.font = {
      name: 'Arial',
      size: 20,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    celdaTitulo.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    celdaTitulo.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B1F3A' }
    };

    worksheet.getRow(1).height = 32;
    worksheet.getRow(2).height = 32;
    worksheet.getRow(3).height = 20;

    const logoBase64 = await this.obtenerLogoBase64();

    if (logoBase64) {
      const logoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png'
      });

      worksheet.addImage(logoId, {
        tl: { col: 0.2, row: 0.3 },
        ext: { width: 105, height: 80 }
      });
    }

    worksheet.mergeCells('A4:J4');

    const celdaFecha = worksheet.getCell('A4');
    celdaFecha.value = `Generado automáticamente desde el Panel Admin | Fecha: ${new Date().toLocaleString()}`;
    celdaFecha.font = {
      name: 'Arial',
      size: 11,
      italic: true,
      color: { argb: 'FF334155' }
    };
    celdaFecha.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    celdaFecha.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0F2FE' }
    };

    const total = this.solicitudes.length;
    const recibidos = this.solicitudes.filter(item => item.estado === 'Recibido').length;
    const proceso = this.solicitudes.filter(item => item.estado === 'En Proceso').length;
    const completados = this.solicitudes.filter(item => item.estado === 'Completado').length;

    worksheet.mergeCells('A6:B6');
    worksheet.mergeCells('C6:D6');
    worksheet.mergeCells('E6:F6');
    worksheet.mergeCells('G6:H6');
    worksheet.mergeCells('I6:J6');

    worksheet.getCell('A6').value = `TOTAL: ${total}`;
    worksheet.getCell('C6').value = `RECIBIDOS: ${recibidos}`;
    worksheet.getCell('E6').value = `EN PROCESO: ${proceso}`;
    worksheet.getCell('G6').value = `COMPLETADOS: ${completados}`;
    worksheet.getCell('I6').value = 'CRISHOTECH';

    ['A6', 'C6', 'E6', 'G6', 'I6'].forEach((celda) => {
      worksheet.getCell(celda).font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };

      worksheet.getCell(celda).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };

      worksheet.getCell(celda).border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };
    });

    worksheet.getCell('A6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    };

    worksheet.getCell('C6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' }
    };

    worksheet.getCell('E6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' }
    };

    worksheet.getCell('G6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' }
    };

    worksheet.getCell('I6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7E22CE' }
    };

    worksheet.getRow(6).height = 28;

    const filaEncabezado = worksheet.getRow(8);

    filaEncabezado.values = [
      'N°',
      'Cliente',
      'Cédula',
      'Teléfono',
      'Correo',
      'Dirección',
      'Servicio',
      'Descripción',
      'Estado',
      'Fecha'
    ];

    filaEncabezado.height = 26;

    filaEncabezado.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF111827' }
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    this.solicitudes.forEach((item, index) => {
      const fila = worksheet.addRow({
        nro: index + 1,
        cliente: item.nombre,
        cedula: item.cedula,
        telefono: item.telefono,
        correo: item.correo,
        direccion: item.direccion,
        servicio: item.servicio,
        descripcion: item.descripcion,
        estado: item.estado,
        fecha: item.fecha ? new Date(item.fecha).toLocaleString() : ''
      });

      fila.height = 42;

      fila.eachCell((cell) => {
        cell.font = {
          name: 'Arial',
          size: 10,
          color: { argb: 'FF111827' }
        };

        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC'
          }
        };
      });

      const celdaEstado = fila.getCell(9);

      celdaEstado.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };

      celdaEstado.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };

      if (item.estado === 'Recibido') {
        celdaEstado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0284C7' }
        };
      } else if (item.estado === 'En Proceso') {
        celdaEstado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF59E0B' }
        };
      } else if (item.estado === 'Completado') {
        celdaEstado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF16A34A' }
        };
      } else {
        celdaEstado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF64748B' }
        };
      }

      fila.getCell(1).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };

      fila.getCell(3).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };

      fila.getCell(4).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };

      fila.getCell(10).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
    });

    worksheet.autoFilter = {
      from: 'A8',
      to: `J${this.solicitudes.length + 8}`
    };

    worksheet.getCell(`A${this.solicitudes.length + 10}`).value = 'Reporte generado por el sistema web CrishoTech.';
    worksheet.getCell(`A${this.solicitudes.length + 10}`).font = {
      name: 'Arial',
      size: 10,
      italic: true,
      color: { argb: 'FF64748B' }
    };

    worksheet.mergeCells(`A${this.solicitudes.length + 10}:J${this.solicitudes.length + 10}`);

    const buffer = await workbook.xlsx.writeBuffer();

    const archivo = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(archivo, `reporte_crishotech_${new Date().getTime()}.xlsx`);

    this.mensajeExitoPanel = 'Reporte Excel generado correctamente.';
  }
}