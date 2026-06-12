// Importaciones necesarias para el componente Inicio.
import { Component } from '@angular/core';
import { Servicios } from '../servicios/servicios';
import { Footer } from '../footer/footer';

// Configuración del componente Inicio.
@Component({
  selector: 'app-inicio',
  imports: [Servicios, Footer],
  templateUrl: './inicio.html',
})
export class Inicio {

}