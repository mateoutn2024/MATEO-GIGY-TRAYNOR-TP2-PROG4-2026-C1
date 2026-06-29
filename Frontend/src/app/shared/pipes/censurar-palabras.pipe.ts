import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'censurarPalabras',
  standalone: true
})
export class CensurarPalabrasPipe implements PipeTransform {
  private palabrasProhibidas = ['boludo', 'pelotudo', 'idiota', 'forro', 'puto', 'mierda'];

  transform(mensaje: string): string {
    if (!mensaje) return '';

    let textoLimpio = mensaje;
    
    this.palabrasProhibidas.forEach(palabra => {
      const regex = new RegExp(palabra, 'gi');
      const censura = palabra[0] + '*'.repeat(palabra.length - 2) + palabra[palabra.length - 1];
      textoLimpio = textoLimpio.replace(regex, censura);
    });

    return textoLimpio;
  }
}