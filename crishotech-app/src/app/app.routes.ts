import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Carrito } from './components/carrito/carrito';
import { Historial } from './components/historial/historial';
import { PanelAdmin } from './components/panel-admin/panel-admin';
import { usuarioGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  { path: 'carrito', component: Carrito, canActivate: [usuarioGuard] },
  { path: 'historial', component: Historial, canActivate: [usuarioGuard] },
  { path: 'admin', component: PanelAdmin, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];