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
        alert('Error al cargar usuarios desde MongoDB.');
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

  abrirEditarUsuario(usuario: Usuario) {
    this.idUsuarioEditando = usuario._id;
    this.mostrarPasswordUsuario = false;

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

  guardarEdicionUsuario(event: Event) {
    event.preventDefault();

    if (!this.idUsuarioEditando) {
      return;
    }

    if (
      this.usuarioEditando.nombre.trim() === '' ||
      !this.usuarioEditando.apellido ||
      this.usuarioEditando.apellido.trim() === '' ||
      this.usuarioEditando.email.trim() === '' ||
      this.usuarioEditando.rol.trim() === ''
    ) {
      alert('Nombre, apellido, correo y rol son obligatorios.');
      return;
    }

    this.authService.actualizarUsuario(this.idUsuarioEditando, this.usuarioEditando).subscribe({
      next: () => {
        alert('Usuario actualizado correctamente.');
        this.cerrarEditarUsuario();
        this.cargarUsuarios();
      },
      error: () => {
        alert('Error al actualizar usuario.');
      }
    });
  }

  eliminarUsuario(id: string | undefined) {
    if (!id) return;

    const usuarioActual = this.authService.usuarioActual();

    if (usuarioActual?._id === id) {
      alert('No puedes eliminar tu propia cuenta mientras estás logueado.');
      return;
    }

    const confirmar = confirm('¿Eliminar definitivamente este usuario?');

    if (!confirmar) {
      return;
    }

    this.authService.eliminarUsuario(id).subscribe({
      next: () => {
        alert('Usuario eliminado correctamente.');
        this.cargarUsuarios();
      },
      error: () => {
        alert('Error al eliminar usuario.');
      }
    });
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
    if (this.solicitudes.length === 0) {
      alert('No hay solicitudes para exportar.');
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
  }
}