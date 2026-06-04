import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // Datos que escribe el usuario en el formulario.
  email: string = '';
  password: string = '';

  // Mensajes de error para mostrar en pantalla.
  errorEmail: string = '';
  errorPassword: string = '';
  errorGeneral: string = '';

  // Inyectamos AuthService para iniciar sesión y Router para redireccionar.
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Evento (keydown): permite iniciar sesión con Ctrl + Enter.
  atajoLogin(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.iniciarSesion(event);
    }
  }

  // Evento (input): valida el correo mientras el usuario escribe.
  validarEmailEnTiempoReal() {
    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.email.length === 0) {
      this.errorEmail = '';
    } else if (!correoValido.test(this.email)) {
      this.errorEmail = 'El correo debe tener un formato correcto.';
    } else {
      this.errorEmail = '';
    }
  }

  // Evento (keyup): limpia el error de contraseña mientras el usuario escribe.
  validarPasswordEnTiempoReal() {
    if (this.password.length > 0) {
      this.errorPassword = '';
      this.errorGeneral = '';
    }
  }

  // Evento (submit): valida el formulario e inicia sesión.
  iniciarSesion(event: Event) {
    event.preventDefault();

    this.errorEmail = '';
    this.errorPassword = '';
    this.errorGeneral = '';

    let hayError = false;

    if (this.email.trim() === '') {
      this.errorEmail = 'El correo es obligatorio.';
      hayError = true;
    }

    if (this.password.trim() === '') {
      this.errorPassword = 'La contraseña es obligatoria.';
      hayError = true;
    }

    if (hayError) {
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        alert('Inicio de sesión correcto.');

        if (this.authService.esAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/historial']);
        }
      },
      error: (error) => {
        this.errorGeneral = error.error?.mensaje || 'Correo o contraseña incorrectos.';
      }
    });
  }

}