import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './map.component/map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Isolated-Leaf');
}
