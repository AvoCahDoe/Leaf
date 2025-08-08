import { HeaderComponent } from './core/components/header/header';
// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // Nécessaire pour <router-outlet>

import { MapComponent } from './features/map/map/map';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
        RouterOutlet,
        HeaderComponent, // Ajoutez RouterOutlet

    MapComponent  // Import the MapComponent so it can be used in the template
  ],

  templateUrl: './app.html',
  styleUrls: ['./app.scss'] // Or styleUrls: ['./app.component.css'] if using CSS
})


export class AppComponent {
}
