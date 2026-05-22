import { Component } from '@angular/core';
import { Servicios } from '../servicios/servicios';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-inicio',
  imports: [Servicios, Footer],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {

}