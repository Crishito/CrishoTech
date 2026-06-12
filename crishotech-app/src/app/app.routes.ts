// Importaciones necesarias para configurar las rutas de la aplicación.
import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Carrito } from './components/carrito/carrito';
import { Historial } from './components/historial/historial';
import { PanelAdmin } from './components/panel-admin/panel-admin';
import { usuarioGuard, adminGuard } from './guards/auth.guard';

// Definición de rutas principales del sistema.
export const routes: Routes = [
  // Ruta principal que carga la página de inicio.
  { path: '', component: Inicio },

  // Rutas públicas para iniciar sesión y registrarse.
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  // Rutas protegidas para usuarios/clientes.
  { path: 'carrito', component: Carrito, canActivate: [usuarioGuard] },
  { path: 'historial', component: Historial, canActivate: [usuarioGuard] },

  // Ruta protegida solo para el administrador.
  { path: 'admin', component: PanelAdmin, canActivate: [adminGuard] },

  // Redirige cualquier ruta no existente hacia el inicio.
  { path: '**', redirectTo: '' }
];