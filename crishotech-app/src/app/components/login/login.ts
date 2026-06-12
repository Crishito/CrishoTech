// Importaciones necesarias para el componente Login.
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Configuración del componente Login.
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {

  // Datos ingresados por el usuario.
  email: string = '';
  password: string = '';

  // Mensajes de validación y errores.
  errorEmail: string = '';
  errorPassword: string = '';
  errorGeneral: string = '';

  // Mensaje visual de éxito.
  mensajeExito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Recibe mensajes enviados desde rutas protegidas o guards.
    this.route.queryParams.subscribe(params => {
      if (params['mensaje']) {
        this.errorGeneral = params['mensaje'];
      }
    });
  }

  // Permite iniciar sesión usando Ctrl + Enter.
  atajoLogin(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.iniciarSesion(event);
    }
  }

  // Valida el formato del correo mientras el usuario escribe.
  validarEmailEnTiempoReal() {
    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    this.errorGeneral = '';
    this.mensajeExito = '';

    if (this.email.length === 0) {
      this.errorEmail = '';
    } else if (!correoValido.test(this.email)) {
      this.errorEmail = 'El correo debe tener un formato correcto.';
    } else {
      this.errorEmail = '';
    }
  }

  // Limpia errores relacionados con la contraseña.
  validarPasswordEnTiempoReal() {
    this.mensajeExito = '';

    if (this.password.length > 0) {
      this.errorPassword = '';
      this.errorGeneral = '';
    }
  }

  // Valida el formulario y envía las credenciales al backend.
  iniciarSesion(event: Event) {
    event.preventDefault();

    this.errorEmail = '';
    this.errorPassword = '';
    this.errorGeneral = '';
    this.mensajeExito = '';

    let hayError = false;

    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.email.trim() === '') {
      this.errorEmail = 'El correo es obligatorio.';
      hayError = true;
    } else if (!correoValido.test(this.email)) {
      this.errorEmail = 'El correo debe tener un formato correcto.';
      hayError = true;
    }

    if (this.password.trim() === '') {
      this.errorPassword = 'La contraseña es obligatoria.';
      hayError = true;
    } else if (this.password.trim().length < 8) {
      this.errorPassword = 'La contraseña debe tener mínimo 8 caracteres.';
      hayError = true;
    }

    if (hayError) {
      return;
    }

    // Llama al servicio de autenticación para iniciar sesión.
    this.authService.login(this.email.trim(), this.password.trim()).subscribe({
      next: () => {
        this.mensajeExito = 'Inicio de sesión correcto.';

        // Redirige según el rol del usuario autenticado.
        setTimeout(() => {
          if (this.authService.esAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/historial']);
          }
        }, 700);
      },
      error: (error) => {
        this.errorGeneral = error.error?.mensaje || 'Correo o contraseña incorrectos.';
      }
    });
  }

}