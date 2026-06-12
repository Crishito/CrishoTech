// Importaciones necesarias para crear guards y redirigir rutas.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard que permite el acceso solo a usuarios con rol de cliente.
export const usuarioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica si el usuario tiene rol de cliente.
  if (authService.esUsuario()) {
    return true;
  }

  // Redirige al login si no cumple con el rol requerido.
  router.navigate(['/login'], {
    queryParams: {
      mensaje: 'Debes iniciar sesión como cliente para acceder.'
    }
  });

  return false;
};

// Guard que permite el acceso solo al administrador.
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica si el usuario tiene rol de administrador.
  if (authService.esAdmin()) {
    return true;
  }

  // Redirige al login si no tiene permiso para entrar al panel técnico.
  router.navigate(['/login'], {
    queryParams: {
      mensaje: 'Solo el administrador puede acceder al panel técnico.'
    }
  });

  return false;
};