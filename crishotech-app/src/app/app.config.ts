// Importaciones necesarias para la configuración principal de Angular.
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// Configuración principal de la aplicación.
export const appConfig: ApplicationConfig = {
  providers: [
    // Maneja errores globales del navegador.
    provideBrowserGlobalErrorListeners(),

    // Optimiza la detección de cambios en Angular.
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Activa el sistema de rutas de la aplicación.
    provideRouter(routes),

    // Permite realizar peticiones HTTP al backend.
    provideHttpClient()
  ]
};