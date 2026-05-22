import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const usuarioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esUsuario()) {
    return true;
  }

  alert('Debes iniciar sesión como cliente para acceder.');
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin()) {
    return true;
  }

  alert('Solo el administrador puede acceder al panel técnico.');
  router.navigate(['/login']);
  return false;
};