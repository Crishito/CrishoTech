import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

  // Mensaje de éxito para mostrar en pantalla sin usar alert.
  mensajeExito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Recibe mensajes enviados desde los guards.
    // Ejemplo: cuando intenta entrar al historial sin ser cliente.
    this.route.queryParams.subscribe(params => {
      if (params['mensaje']) {
        this.errorGeneral = params['mensaje'];
      }
    });
  }

  // Permite iniciar sesión con Ctrl + Enter.
  atajoLogin(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.iniciarSesion(event);
    }
  }

  // Valida el correo mientras el usuario escribe.
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

  // Limpia el error de contraseña mientras el usuario escribe.
  validarPasswordEnTiempoReal() {
    this.mensajeExito = '';

    if (this.password.length > 0) {
      this.errorPassword = '';
      this.errorGeneral = '';
    }
  }

  // Valida el formulario e inicia sesión.
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

    this.authService.login(this.email.trim(), this.password.trim()).subscribe({
      next: () => {
        this.mensajeExito = 'Inicio de sesión correcto.';

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