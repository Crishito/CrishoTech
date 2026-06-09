import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const usuarioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esUsuario()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: {
      mensaje: 'Debes iniciar sesión como cliente para acceder.'
    }
  });

  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: {
      mensaje: 'Solo el administrador puede acceder al panel técnico.'
    }
  });

  return false;
};