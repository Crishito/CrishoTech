import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  nombre: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';

  // Por defecto, toda cuenta creada desde el registro será usuario.
  rol: 'usuario' | 'admin' = 'usuario';

  errorNombre: string = '';
  errorApellido: string = '';
  errorEmail: string = '';
  errorPassword: string = '';
  errorGeneral: string = '';

  // Mensaje verde para mostrar que la cuenta fue creada sin usar alert.
  mensajeExito: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  atajoRegistrar(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.registrarUsuario(event);
    }
  }

  registrarUsuario(event: Event) {
    event.preventDefault();

    this.errorNombre = '';
    this.errorApellido = '';
    this.errorEmail = '';
    this.errorPassword = '';
    this.errorGeneral = '';
    this.mensajeExito = '';

    let hayError = false;

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.nombre.trim() === '') {
      this.errorNombre = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!soloLetras.test(this.nombre)) {
      this.errorNombre = 'El nombre debe contener solo letras.';
      hayError = true;
    }

    if (this.apellido.trim() === '') {
      this.errorApellido = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!soloLetras.test(this.apellido)) {
      this.errorApellido = 'El apellido debe contener solo letras.';
      hayError = true;
    }

    if (this.email.trim() === '') {
      this.errorEmail = 'Este campo es obligatorio.';
      hayError = true;
    } else if (!correoValido.test(this.email)) {
      this.errorEmail = 'El correo debe tener un formato correcto.';
      hayError = true;
    }

    if (this.password.trim() === '') {
      this.errorPassword = 'Este campo es obligatorio.';
      hayError = true;
    } else if (this.password.length < 8) {
      this.errorPassword = 'La contraseña debe tener mínimo 8 caracteres.';
      hayError = true;
    }

    if (hayError) {
      return;
    }

    // Si no hay admin logueado, siempre se registra como usuario normal.
    const rolFinal: 'usuario' | 'admin' = this.authService.esAdmin() ? this.rol : 'usuario';

    this.authService.registrar({
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      rol: rolFinal
    }).subscribe({
      next: () => {
        this.mensajeExito = 'Cuenta creada correctamente.';

        this.nombre = '';
        this.apellido = '';
        this.email = '';
        this.password = '';
        this.rol = 'usuario';

        setTimeout(() => {
          if (this.authService.esAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/login']);
          }
        }, 900);
      },
      error: (error) => {
        this.errorGeneral = error.error?.mensaje || 'Error al registrar usuario.';
      }
    });
  }

  validarNombreEnTiempoReal() {
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (this.nombre.length === 0) {
      this.errorNombre = '';
    } else if (!soloLetras.test(this.nombre)) {
      this.errorNombre = 'El nombre debe contener solo letras.';
    } else {
      this.errorNombre = '';
    }
  }

  validarApellidoEnTiempoReal() {
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (this.apellido.length === 0) {
      this.errorApellido = '';
    } else if (!soloLetras.test(this.apellido)) {
      this.errorApellido = 'El apellido debe contener solo letras.';
    } else {
      this.errorApellido = '';
    }
  }

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

  validarPasswordEnTiempoReal() {
    if (this.password.length === 0) {
      this.errorPassword = '';
    } else if (this.password.length < 8) {
      this.errorPassword = 'La contraseña debe tener mínimo 8 caracteres.';
    } else {
      this.errorPassword = '';
    }
  }
}