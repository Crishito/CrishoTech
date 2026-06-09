import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SolicitudService } from '../../services/solicitud.service';
import { Solicitud } from '../../models/solicitud';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-servicios',
  imports: [FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService,
    private router: Router
  ) {}

  modalAbierto = false;
  servicioSeleccionado = '';

  mensajeExitoSolicitud = '';
  mensajeErrorSolicitud = '';
  mensajeAvisoPagina = '';

  solicitud = {
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    descripcion: ''
  };

  errores = {
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    descripcion: ''
  };

  servicios = [
    {
      nombre: 'Mantenimiento Preventivo',
      icono: 'fa-solid fa-fan text-blue-600 text-2xl group-hover:text-white',
      imagen: '/img/mantenimiento-preventivo.jpg',
      descripcion: 'Limpieza interna profunda, optimización de software y cambio de pasta térmica para prolongar la vida útil de tus equipos.'
    },
    {
      nombre: 'Mantenimiento Correctivo',
      icono: 'fa-solid fa-screwdriver-wrench text-blue-600 text-2xl group-hover:text-white',
      imagen: '/img/mantenimiento-correctivo.jpg',
      descripcion: 'Diagnóstico y reparación de fallas de hardware y software, reemplazo de componentes y solución de problemas críticos.'
    },
    {
      nombre: 'Instalación de Sistemas Operativos.',
      icono: 'fa-solid fa-compact-disc text-blue-600 text-2xl group-hover:text-white',
      imagen: '/img/instalacion-sistemas-operativo.jpg',
      descripcion: 'Formateo, instalación limpia de Windows, Linux o macOS, configuración inicial y drivers esenciales.'
    },
    {
      nombre: 'Instalación de Programas',
      icono: 'fa-solid fa-box-open text-blue-600 text-2xl group-hover:text-white',
      imagen: '/img/instalacion-programas.jpg',
      descripcion: 'Paquete Office, navegadores, antivirus y software básico para tu trabajo o estudio.'
    },
    {
      nombre: 'Optimización y Seguridad',
      icono: 'fa-solid fa-shield-virus text-blue-600 text-2xl group-hover:text-white',
      imagen: '/img/seguridad.jpg',
      descripcion: 'Aceleración del sistema, eliminación de virus y malware, y configuración de actualizaciones para un rendimiento óptimo.'
    }
  ];

  abrirModal(nombreServicio: string) {
    this.mensajeAvisoPagina = '';
    this.mensajeExitoSolicitud = '';
    this.mensajeErrorSolicitud = '';

    if (!this.authService.estaLogueado()) {
      this.mensajeAvisoPagina = 'Debes iniciar sesión para solicitar un servicio.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 900);

      return;
    }

    if (this.authService.esAdmin()) {
      this.mensajeAvisoPagina = 'El administrador debe gestionar solicitudes desde el panel técnico.';

      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 900);

      return;
    }

    this.servicioSeleccionado = nombreServicio;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.mensajeExitoSolicitud = '';
    this.mensajeErrorSolicitud = '';
    this.limpiarErrores();
  }

  limpiarErrores() {
    this.errores = {
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: '',
      descripcion: ''
    };
  }

  bloquearLetras(event: KeyboardEvent) {
    const teclasPermitidas = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Enter'
    ];

    if (teclasPermitidas.includes(event.key)) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  limpiarNombre() {
    this.solicitud.nombre = this.solicitud.nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    this.validarNombreEnTiempoReal();
  }

  limpiarCedula() {
    this.solicitud.cedula = this.solicitud.cedula.replace(/\D/g, '');
    this.validarCedulaEnTiempoReal();
  }

  limpiarTelefono() {
    this.solicitud.telefono = this.solicitud.telefono.replace(/\D/g, '');
    this.validarTelefonoEnTiempoReal();
  }

  validarNombreEnTiempoReal() {
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (this.solicitud.nombre.length === 0) {
      this.errores.nombre = '';
    } else if (!soloLetras.test(this.solicitud.nombre)) {
      this.errores.nombre = 'El nombre debe contener solo letras.';
    } else {
      this.errores.nombre = '';
    }
  }

  validarCedulaEnTiempoReal() {
    if (this.solicitud.cedula.length === 0) {
      this.errores.cedula = '';
    } else if (this.solicitud.cedula.length < 10) {
      this.errores.cedula = 'La cédula debe tener 10 dígitos.';
    } else {
      this.errores.cedula = '';
    }
  }

  validarTelefonoEnTiempoReal() {
    if (this.solicitud.telefono.length === 0) {
      this.errores.telefono = '';
    } else if (this.solicitud.telefono.length < 10) {
      this.errores.telefono = 'El teléfono debe tener 10 dígitos.';
    } else {
      this.errores.telefono = '';
    }
  }

  validarCorreoEnTiempoReal() {
    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.solicitud.correo.length === 0) {
      this.errores.correo = '';
    } else if (!correoValido.test(this.solicitud.correo)) {
      this.errores.correo = 'Ingrese un correo válido.';
    } else {
      this.errores.correo = '';
    }
  }

  validarDireccionEnTiempoReal() {
    if (this.solicitud.direccion.length === 0) {
      this.errores.direccion = '';
    } else if (this.solicitud.direccion.trim().length < 5) {
      this.errores.direccion = 'La dirección debe ser más específica.';
    } else {
      this.errores.direccion = '';
    }
  }

  validarDescripcionEnTiempoReal() {
    if (this.solicitud.descripcion.length === 0) {
      this.errores.descripcion = '';
    } else if (this.solicitud.descripcion.trim().length < 10) {
      this.errores.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    } else {
      this.errores.descripcion = '';
    }
  }

  guardarSolicitud(event: Event) {
    event.preventDefault();

    this.limpiarErrores();
    this.mensajeExitoSolicitud = '';
    this.mensajeErrorSolicitud = '';

    let hayError = false;

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.solicitud.nombre.trim() === '') {
      this.errores.nombre = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!soloLetras.test(this.solicitud.nombre.trim())) {
      this.errores.nombre = 'El nombre debe contener solo letras.';
      hayError = true;
    }

    if (this.solicitud.cedula.trim() === '') {
      this.errores.cedula = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!/^\d{10}$/.test(this.solicitud.cedula)) {
      this.errores.cedula = 'La cédula debe contener exactamente 10 dígitos.';
      hayError = true;
    }

    if (this.solicitud.telefono.trim() === '') {
      this.errores.telefono = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!/^\d{10}$/.test(this.solicitud.telefono)) {
      this.errores.telefono = 'El teléfono debe contener 10 dígitos.';
      hayError = true;
    }

    if (this.solicitud.correo.trim() === '') {
      this.errores.correo = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!correoValido.test(this.solicitud.correo.trim())) {
      this.errores.correo = 'Ingrese un correo válido.';
      hayError = true;
    }

    if (this.solicitud.direccion.trim() === '') {
      this.errores.direccion = 'Este campo es obligatorio.';
      hayError = true;
    } else if (this.solicitud.direccion.trim().length < 5) {
      this.errores.direccion = 'La dirección debe ser más específica.';
      hayError = true;
    }

    if (this.solicitud.descripcion.trim() === '') {
      this.errores.descripcion = 'Este campo es obligatorio.';
      hayError = true;
    } else if (this.solicitud.descripcion.trim().length < 10) {
      this.errores.descripcion = 'La descripción debe tener al menos 10 caracteres.';
      hayError = true;
    }

    if (hayError) {
      this.mensajeErrorSolicitud = 'Revisa los campos marcados antes de continuar.';
      return;
    }

    const nuevaSolicitud: Solicitud = {
      id: Date.now(),
      servicio: this.servicioSeleccionado,
      nombre: this.solicitud.nombre.trim(),
      cedula: this.solicitud.cedula.trim(),
      telefono: this.solicitud.telefono.trim(),
      correo: this.solicitud.correo.trim().toLowerCase(),
      direccion: this.solicitud.direccion.trim(),
      descripcion: this.solicitud.descripcion.trim(),
      estado: 'Recibido',
      fecha: new Date().toISOString()
    };

    this.solicitudService.agregarAlCarrito(nuevaSolicitud);

    console.log('Solicitud agregada al carrito:', nuevaSolicitud);
    console.log('Carrito después de agregar:', this.solicitudService.obtenerCarrito());

    this.mensajeExitoSolicitud = 'Servicio añadido al carrito correctamente.';

    this.solicitud = {
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: '',
      descripcion: ''
    };

    setTimeout(() => {
      this.cerrarModal();
    }, 900);
  }

}