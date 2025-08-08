import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Import Router directives

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Import Router directives
  templateUrl: './header.html',
  styleUrls: ['./header.scss'] // ou .css
})
export class HeaderComponent { }
