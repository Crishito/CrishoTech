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

  errorNombre: string = '';
  errorApellido: string = '';
  errorEmail: string = '';
  errorPassword: string = '';

  constructor(
    private authService: AuthService,
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

    const registrado = this.authService.registrar({
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      rol: 'usuario'
    });

    if (!registrado) {
      this.errorEmail = 'Este correo ya está registrado.';
      return;
    }

    alert('Cuenta creada correctamente. Ahora inicia sesión.');
    this.router.navigate(['/login']);
  }

  validarNombreEnTiempoReal() {}
  validarApellidoEnTiempoReal() {}
  validarEmailEnTiempoReal() {}
  validarPasswordEnTiempoReal() {}
}