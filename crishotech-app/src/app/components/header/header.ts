// IMPORTA COMPONENT, HOSTLISTENER Y ROUTER
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

// IMPORTA EL SERVICIO DE AUTENTICACIÓN
import { AuthService } from '../../services/auth.service';

// CONFIGURACIÓN DEL COMPONENTE HEADER
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

// COMPONENTE HEADER
export class Header {

  // CONSTRUCTOR CON SERVICIOS
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  // NAVEGA A UNA SECCIÓN DE LA PÁGINA
  irASeccion(idSeccion: string) {

    this.router.navigate(['/']).then(() => {

      setTimeout(() => {

        const seccion = document.getElementById(idSeccion);

        if (seccion) {

          seccion.scrollIntoView({
            behavior: 'smooth'
          });

        }

      }, 100);

    });

  }

  // CIERRA LA SESIÓN
  cerrarSesion() {

    this.authService.cerrarSesion();
    this.router.navigate(['/']);

  }

  // ATAJOS DE TECLADO
  @HostListener('document:keydown', ['$event'])
  manejarAtajos(event: KeyboardEvent) {

    const tecla = event.key ? event.key.toLowerCase() : '';

    // CTRL + I = INICIO
    if (event.ctrlKey && tecla === 'i') {
      event.preventDefault();
      this.irASeccion('inicio');
    }

    // CTRL + S = SERVICIOS
    if (event.ctrlKey && tecla === 's') {
      event.preventDefault();
      this.irASeccion('servicios');
    }

    // CTRL + shift + C = CONTACTO
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.irASeccion('contacto');
    }

    // CTRL + M = MISIÓN Y VISIÓN
    if (event.ctrlKey && tecla === 'm') {
      event.preventDefault();
      this.irASeccion('mision-vision');
    }

  }

}