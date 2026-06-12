// Importa Component para definir el componente y HostListener para escuchar eventos del teclado.
import { Component, HostListener } from '@angular/core';
// Importa Router para redireccionar y RouterLink para usar navegación en el HTML.
import { Router, RouterLink } from '@angular/router';
// Importa el servicio de autenticación para validar sesión, rol y cierre de sesión.
import { AuthService } from '../../services/auth.service';

// Decorador que configura el componente Header de la aplicación.
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
})

// Clase principal del componente Header.
// Controla la navegación, cierre de sesión y atajos de teclado.
export class Header {

  // Constructor que inyecta el servicio de autenticación y el router de Angular.
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  // Método que permite navegar hacia una sección específica de la página principal.
  irASeccion(idSeccion: string) {

    // Primero redirige al inicio para asegurar que la sección exista en pantalla.
    this.router.navigate(['/']).then(() => {

      // Espera un momento para que la página cargue antes de buscar la sección.
      setTimeout(() => {

        // Busca en el documento HTML la sección que coincide con el id recibido.
        const seccion = document.getElementById(idSeccion);

        // Si la sección existe, realiza el desplazamiento suave hacia ella.
        if (seccion) {

          seccion.scrollIntoView({
            behavior: 'smooth'
          });

        }

      }, 100);

    });

  }

  // Método encargado de cerrar la sesión del usuario actual.
  cerrarSesion() {

    // Llama al servicio de autenticación para eliminar los datos de sesión.
    this.authService.cerrarSesion();

    // Redirige al usuario a la página principal después de cerrar sesión.
    this.router.navigate(['/']);

  }

  // HostListener escucha el evento keydown en todo el documento.
  // Permite ejecutar atajos de teclado dentro de la aplicación.
  @HostListener('document:keydown', ['$event'])
  manejarAtajos(event: KeyboardEvent) {

    // Convierte la tecla presionada a minúscula para evitar errores por mayúsculas.
    const tecla = event.key ? event.key.toLowerCase() : '';

    // Atajo CTRL + I: navega a la sección Inicio.
    if (event.ctrlKey && tecla === 'i') {
      event.preventDefault();
      this.irASeccion('inicio');
    }

    // Atajo CTRL + S: navega a la sección Servicios.
    if (event.ctrlKey && tecla === 's') {
      event.preventDefault();
      this.irASeccion('servicios');
    }

    // Atajo CTRL + SHIFT + C: navega a la sección Contacto.
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.irASeccion('contacto');
    }

    // Atajo CTRL + M: navega a la sección Misión y Visión.
    if (event.ctrlKey && tecla === 'm') {
      event.preventDefault();
      this.irASeccion('mision-vision');
    }

  }

}