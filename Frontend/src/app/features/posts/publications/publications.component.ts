import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent {
  // Estructura de vista requerida para Sprint 1
  mockPublications = [
    { title: 'Bienvenidos a la Red', message: 'Este es el espacio inicial de nuestra comunidad.', author: 'Admin' },
    { title: 'Primeros Pasos en Angular', message: 'Comparto mi emoción usando componentes autónomos.', author: 'Mateo' }
  ];
}