import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverCard]',
  standalone: true
})
export class HoverCardDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.25s ease-in-out');
  }

  @HostListener('mouseenter') 
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-6px)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 12px 20px rgba(0, 0, 0, 0.12)');
  }

  @HostListener('mouseleave') 
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
  }
}