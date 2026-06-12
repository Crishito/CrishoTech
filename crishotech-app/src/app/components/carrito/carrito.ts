// Importa el decorador Component de Angular para definir este archivo como un componente.
import { Component } from '@angular/core';
// Importa Router para redireccionar y RouterLink para usar navegación en el HTML.
import { Router, RouterLink } from '@angular/router';
// Importa el modelo Solicitud para tipar correctamente las solicitudes del carrito.
import { Solicitud } from '../../models/solicitud';
// Importa el servicio encargado de manejar el carrito y las solicitudes.
import { SolicitudService } from '../../services/solicitud.service';
// Importa el servicio de autenticación para identificar al usuario logueado.
import { AuthService } from '../../services/auth.service';

// Decorador que define la configuración del componente Carrito.
@Component({
  selector: 'app-carrito', // Nombre del selector usado para llamar este componente.
  imports: [RouterLink], // Permite usar routerLink en el archivo HTML.
  templateUrl: './carrito.html', // Archivo HTML asociado al componente.
})
export class Carrito {

  // Arreglo donde se almacenan las solicitudes temporales agregadas al carrito.
  solicitudes: Solicitud[] = [];

  // Mensaje visual de éxito para informar acciones correctas al usuario.
  mensajeExitoCarrito: string = '';

  // Mensaje visual de error para informar problemas en el carrito o conexión.
  mensajeErrorCarrito: string = '';

  // Mensaje visual de aviso para informar acciones pendientes o advertencias.
  mensajeAvisoCarrito: string = '';

  // Constructor que inyecta los servicios necesarios para manejar solicitudes, autenticación y navegación.
  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService,
    private router: Router
  ) {
    // Al cargar el componente, se obtiene la información actual del carrito.
    this.cargarCarrito();
  }

  // Limpia todos los mensajes visuales antes de ejecutar una nueva acción.
  limpiarMensajes() {
    this.mensajeExitoCarrito = '';
    this.mensajeErrorCarrito = '';
    this.mensajeAvisoCarrito = '';
  }

  // Carga las solicitudes guardadas temporalmente en el carrito desde el servicio.
  cargarCarrito() {
    this.solicitudes = this.solicitudService.obtenerCarrito();

    // Muestra en consola las solicitudes cargadas para facilitar la depuración.
    console.log('Carrito cargado:', this.solicitudes);
  }

  // Elimina una solicitud específica del carrito usando su identificador.
  eliminarSolicitud(id: number | undefined) {
    this.limpiarMensajes();

    // Valida que exista un ID antes de intentar eliminar la solicitud.
    if (!id) {
      this.mensajeErrorCarrito = 'No se pudo identificar la solicitud seleccionada.';
      return;
    }

    // Llama al servicio para eliminar la solicitud del carrito.
    this.solicitudService.eliminarDelCarrito(id);

    // Actualiza la lista del carrito después de eliminar.
    this.cargarCarrito();

    // Muestra mensaje de confirmación al usuario.
    this.mensajeExitoCarrito = 'Solicitud quitada del carrito correctamente.';
  }

  // Vacía todas las solicitudes almacenadas en el carrito.
  vaciarCarrito() {
    this.limpiarMensajes();

    // Verifica si el carrito ya está vacío antes de ejecutar la acción.
    if (this.solicitudes.length === 0) {
      this.mensajeAvisoCarrito = 'El carrito ya está vacío.';
      return;
    }

    // Llama al servicio para limpiar el carrito.
    this.solicitudService.vaciarCarrito();

    // Recarga la información del carrito.
    this.cargarCarrito();

    // Muestra mensaje de éxito al usuario.
    this.mensajeExitoCarrito = 'Carrito vaciado correctamente.';
  }

  // Confirma el pedido y envía las solicitudes del carrito al backend para guardarlas en MongoDB.
  confirmarPedido() {
    this.limpiarMensajes();

    // Obtiene la información del usuario que inició sesión.
    const usuarioActual = this.authService.usuarioActual();

    // Si no existe usuario logueado, se muestra un aviso y se redirige al login.
    if (!usuarioActual) {
      this.mensajeAvisoCarrito = 'Debes iniciar sesión para confirmar el pedido.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 900);

      return;
    }

    // Verifica que existan solicitudes antes de confirmar el pedido.
    if (this.solicitudes.length === 0) {
      this.mensajeAvisoCarrito = 'No hay solicitudes para confirmar.';
      return;
    }

    // Asigna el correo del usuario actual a cada solicitud antes de enviarla al backend.
    this.solicitudes.forEach((solicitud) => {
      solicitud.usuarioEmail = usuarioActual.email;
    });

    // Muestra en consola las solicitudes que serán enviadas al backend.
    console.log('Solicitudes que se van a guardar:', this.solicitudes);

    // Genera las peticiones HTTP para guardar las solicitudes en MongoDB.
    const peticiones = this.solicitudService.confirmarPedido();

    // Muestra en consola la cantidad de peticiones creadas.
    console.log('Cantidad de peticiones creadas:', peticiones.length);

    // Valida que existan peticiones antes de continuar.
    if (peticiones.length === 0) {
      this.mensajeAvisoCarrito = 'No hay solicitudes para confirmar.';
      return;
    }

    // Contador para saber cuántas solicitudes fueron guardadas correctamente.
    let completadas = 0;

    // Variable para controlar si ocurrió algún error durante el guardado.
    let huboError = false;

    // Recorre cada petición y la ejecuta para guardar las solicitudes en el backend.
    peticiones.forEach((peticion) => {
      peticion.subscribe({
        // Se ejecuta cuando una solicitud se guarda correctamente.
        next: (respuesta) => {
          console.log('Respuesta del backend:', respuesta);

          completadas++;

          // Cuando todas las peticiones terminan correctamente, se vacía el carrito y se redirige al historial.
          if (completadas === peticiones.length && !huboError) {
            this.solicitudService.vaciarCarrito();
            this.cargarCarrito();

            this.mensajeExitoCarrito = 'Pedido confirmado y guardado correctamente.';

            setTimeout(() => {
              this.router.navigate(['/historial']);
            }, 1000);
          }
        },

        // Se ejecuta si ocurre un error al guardar una solicitud en MongoDB.
        error: (error) => {
          console.error('Error al guardar en MongoDB:', error);

          huboError = true;

          // Muestra un mensaje claro al usuario según la respuesta del backend.
          this.mensajeErrorCarrito =
            error.error?.mensaje || 'Error al guardar una solicitud en MongoDB. Revisa la consola.';
        }
      });
    });
  }

}