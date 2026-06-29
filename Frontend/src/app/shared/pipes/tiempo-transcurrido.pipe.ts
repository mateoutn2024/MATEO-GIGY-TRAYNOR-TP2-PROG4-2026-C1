import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoTranscurrido',
  standalone: true
})
export class TiempoTranscurridoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    const ahora = new Date().getTime();
    const fechaPasada = new Date(value).getTime();
    const diferenciaSegundos = Math.floor((ahora - fechaPasada) / 1000);

    if (diferenciaSegundos < 60) return 'Hace unos segundos';
    
    const minutos = Math.floor(diferenciaSegundos / 60);
    if (minutos < 60) return `Hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return `Hace ${dias} d`;

    return new Date(value).toLocaleDateString();
  }
}