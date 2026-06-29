import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true
})
export class ImgFallbackDirective {
  @Input() appImgFallback: string = '/assets/default-post.png';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  cargarImagenSegura() {
    const imgElement = this.el.nativeElement as HTMLImageElement;
    imgElement.src = this.appImgFallback || 'https://placehold.co/600x400?text=Imagen+No+Disponible';
  }
}