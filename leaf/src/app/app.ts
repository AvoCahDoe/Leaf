import { Component } from '@angular/core';
import { CartMapComponent } from './map/map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CartMapComponent],
  template: `<app-cart-map />`,
})
export class AppComponent {}
