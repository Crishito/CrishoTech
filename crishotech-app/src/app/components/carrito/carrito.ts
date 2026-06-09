// Importa el decorador Component de Angular.
import { Component } from '@angular/core';

// Importa Router para redireccionar y RouterLink para usar enlaces en el HTML.
import { Router, RouterLink } from '@angular/router';

// Importa el modelo Solicitud.
import { Solicitud } from '../../models/solicitud';

// Importa el servicio que maneja el carrito y las solicitudes.
import { SolicitudService } from '../../services/solicitud.service';

// Importa el servicio de autenticación para saber qué usuario está logueado.
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {

  // Aquí se guardan las solicitudes temporales del carrito.
  solicitudes: Solicitud[] = [];

  // Mensaje verde para mostrar acciones exitosas sin usar alert.
  mensajeExitoCarrito: string = '';

  // Mensaje rojo para mostrar errores sin usar alert.
  mensajeErrorCarrito: string = '';

  // Mensaje amarillo para avisos importantes.
  mensajeAvisoCarrito: string = '';

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cargarCarrito();
  }

  // Limpia todos los mensajes visuales del carrito.
  limpiarMensajes() {
    this.mensajeExitoCarrito = '';
    this.mensajeErrorCarrito = '';
    this.mensajeAvisoCarrito = '';
  }

  // Carga las solicitudes guardadas temporalmente en el carrito.
  cargarCarrito() {
    this.solicitudes = this.solicitudService.obtenerCarrito();

    console.log('Carrito cargado:', this.solicitudes);
  }

  // Elimina una sola solicitud del carrito.
  eliminarSolicitud(id: number | undefined) {
    this.limpiarMensajes();

    if (!id) {
      this.mensajeErrorCarrito = 'No se pudo identificar la solicitud seleccionada.';
      return;
    }

    this.solicitudService.eliminarDelCarrito(id);
    this.cargarCarrito();

    this.mensajeExitoCarrito = 'Solicitud quitada del carrito correctamente.';
  }

  // Vacía todas las solicitudes del carrito.
  vaciarCarrito() {
    this.limpiarMensajes();

    if (this.solicitudes.length === 0) {
      this.mensajeAvisoCarrito = 'El carrito ya está vacío.';
      return;
    }

    this.solicitudService.vaciarCarrito();
    this.cargarCarrito();

    this.mensajeExitoCarrito = 'Carrito vaciado correctamente.';
  }

  // Confirma el pedido y guarda las solicitudes en MongoDB.
  confirmarPedido() {
    this.limpiarMensajes();

    const usuarioActual = this.authService.usuarioActual();

    if (!usuarioActual) {
      this.mensajeAvisoCarrito = 'Debes iniciar sesión para confirmar el pedido.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 900);

      return;
    }

    if (this.solicitudes.length === 0) {
      this.mensajeAvisoCarrito = 'No hay solicitudes para confirmar.';
      return;
    }

    this.solicitudes.forEach((solicitud) => {
      solicitud.usuarioEmail = usuarioActual.email;
    });

    console.log('Solicitudes que se van a guardar:', this.solicitudes);

    const peticiones = this.solicitudService.confirmarPedido();

    console.log('Cantidad de peticiones creadas:', peticiones.length);

    if (peticiones.length === 0) {
      this.mensajeAvisoCarrito = 'No hay solicitudes para confirmar.';
      return;
    }

    let completadas = 0;
    let huboError = false;

    peticiones.forEach((peticion) => {
      peticion.subscribe({
        next: (respuesta) => {
          console.log('Respuesta del backend:', respuesta);

          completadas++;

          if (completadas === peticiones.length && !huboError) {
            this.solicitudService.vaciarCarrito();
            this.cargarCarrito();

            this.mensajeExitoCarrito = 'Pedido confirmado y guardado correctamente.';

            setTimeout(() => {
              this.router.navigate(['/historial']);
            }, 1000);
          }
        },
        error: (error) => {
          console.error('Error al guardar en MongoDB:', error);

          huboError = true;

          this.mensajeErrorCarrito =
            error.error?.mensaje || 'Error al guardar una solicitud en MongoDB. Revisa la consola.';
        }
      });
    });
  }

}