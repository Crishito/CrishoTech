// IMPORTA EL DECORADOR COMPONENT DE ANGULAR
import { Component } from '@angular/core';

// IMPORTA EL ROUTER Y ROUTERLINK PARA NAVEGACIÓN
import { Router, RouterLink } from '@angular/router';

// IMPORTA EL MODELO DE SOLICITUD
import { Solicitud } from '../../models/solicitud';

// IMPORTA EL SERVICIO DE SOLICITUDES
import { SolicitudService } from '../../services/solicitud.service';

// IMPORTA EL SERVICIO DE AUTENTICACIÓN
import { AuthService } from '../../services/auth.service';

// DECORADOR DEL COMPONENTE
@Component({

  // NOMBRE DEL SELECTOR HTML
  selector: 'app-carrito',

  // IMPORTACIONES NECESARIAS PARA EL COMPONENTE
  imports: [RouterLink],

  // ARCHIVO HTML DEL COMPONENTE
  templateUrl: './carrito.html',

  // ARCHIVO CSS DEL COMPONENTE
  styleUrl: './carrito.css',

})

// CLASE PRINCIPAL DEL COMPONENTE
export class Carrito {

  // AQUÍ SE GUARDAN LAS SOLICITUDES TEMPORALES DEL CARRITO
  solicitudes: Solicitud[] = [];

  // CONSTRUCTOR DEL COMPONENTE
  // INYECTA EL SERVICIO, EL ROUTER Y EL SERVICIO DE AUTENTICACIÓN
  constructor(

    private solicitudService: SolicitudService,
    private authService: AuthService,
    private router: Router

  ) {

    // CARGA EL CARRITO AL INICIAR EL COMPONENTE
    this.cargarCarrito();

  }

  // MÉTODO PARA CARGAR LAS SOLICITUDES DEL CARRITO
  cargarCarrito() {

    // OBTIENE LAS SOLICITUDES DESDE EL SERVICIO
    this.solicitudes = this.solicitudService.obtenerCarrito();

    // MUESTRA EN CONSOLA EL CONTENIDO DEL CARRITO
    console.log('Carrito cargado:', this.solicitudes);

  }

  // MÉTODO PARA ELIMINAR UNA SOLICITUD DEL CARRITO
  eliminarSolicitud(id: number | undefined) {

    // VERIFICA QUE EL ID EXISTA
    if (!id) {
      return;
    }

    // ELIMINA LA SOLICITUD DEL CARRITO
    this.solicitudService.eliminarDelCarrito(id);

    // RECARGA EL CARRITO
    this.cargarCarrito();

  }

  // MÉTODO PARA VACIAR TODO EL CARRITO
  vaciarCarrito() {

    // ELIMINA TODAS LAS SOLICITUDES
    this.solicitudService.vaciarCarrito();

    // RECARGA EL CARRITO
    this.cargarCarrito();

  }

  // MÉTODO PARA CONFIRMAR EL PEDIDO
  confirmarPedido() {

    // OBTIENE EL USUARIO QUE INICIÓ SESIÓN
    const usuarioActual = this.authService.usuarioActual();

    // SI NO HAY USUARIO LOGUEADO, NO PERMITE CONFIRMAR
    if (!usuarioActual) {
      alert('Debes iniciar sesión para confirmar el pedido.');
      this.router.navigate(['/login']);
      return;
    }

    // ASIGNA EL CORREO DEL USUARIO LOGUEADO A CADA SOLICITUD
    this.solicitudes.forEach((solicitud) => {
      solicitud.usuarioEmail = usuarioActual.email;
    });

    // MUESTRA EN CONSOLA LAS SOLICITUDES A GUARDAR
    console.log('Solicitudes que se van a guardar:', this.solicitudes);

    // CREA LAS PETICIONES HTTP PARA ENVIAR AL BACKEND
    const peticiones = this.solicitudService.confirmarPedido();

    // MUESTRA CUÁNTAS PETICIONES SE GENERARON
    console.log('Cantidad de peticiones creadas:', peticiones.length);

    // VERIFICA SI NO HAY SOLICITUDES
    if (peticiones.length === 0) {

      alert('No hay solicitudes para confirmar.');
      return;

    }

    // CONTADOR DE PETICIONES COMPLETADAS
    let completadas = 0;

    // RECORRE CADA PETICIÓN
    peticiones.forEach((peticion) => {

      // SE SUSCRIBE A LA PETICIÓN HTTP
      peticion.subscribe({

        // SI LA PETICIÓN SALE CORRECTAMENTE
        next: (respuesta) => {

          // MUESTRA LA RESPUESTA DEL BACKEND
          console.log('Respuesta del backend:', respuesta);

          // AUMENTA EL CONTADOR
          completadas++;

          // VERIFICA SI TODAS LAS PETICIONES TERMINARON
          if (completadas === peticiones.length) {

            // VACÍA EL CARRITO
            this.solicitudService.vaciarCarrito();

            // RECARGA EL CARRITO
            this.cargarCarrito();

            // MENSAJE DE ÉXITO
            alert('Pedido confirmado y guardado en MongoDB.');

            // REDIRECCIONA AL HISTORIAL
            this.router.navigate(['/historial']);

          }

        },

        // SI OCURRE UN ERROR
        error: (error) => {

          // MUESTRA EL ERROR EN CONSOLA
          console.error('Error al guardar en MongoDB:', error);

          // MENSAJE DE ERROR
          alert('Error al guardar una solicitud en MongoDB. Revisa la consola.');

        }

      });

    });

  }

}