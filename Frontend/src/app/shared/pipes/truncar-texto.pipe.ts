import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncarTexto',
  standalone: true
})
export class TruncarTextoPipe implements PipeTransform {
  transform(texto: string, limite: number = 80): string {
    if (!texto) return '';
    if (texto.length <= limite) return texto;

    return texto.substring(0, limite) + '...';
  }
}