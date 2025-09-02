import { Component, inject, AfterViewInit } from '@angular/core';
import { MarkerService } from './services/marker.service';
import { Marker } from '../core/models/marker.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  private markerService = inject(MarkerService);
  private map!: L.Map;
  private markers: Marker[] = [];

  ngAfterViewInit(): void {
    const customIcon = L.icon({
  iconUrl: 'assets/blue.png',       // Path to your pin image
  iconSize: [32, 32],                     // Size of the icon
  iconAnchor: [16, 32],                   // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32]                   // Point from which the popup should open relative to the iconAnchor
});

    // Initialize map
    this.map = L.map('map').setView([34.020882, -6.841650], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Load markers from backend
    this.loadMarkersFromDB();
  }








  
  private loadMarkersFromDB(): void {
    this.markerService.getMarkers().subscribe({
      next: (data) => {
        this.markers = data;
        for (const marker of data) {
          this.addMarkerToMap(marker);
        }
      },
      error: (error) => {
        console.error('Error loading markers:', error);
        alert('Erreur lors du chargement des marqueurs.');
      }
    });
  }

  private addMarkerToMap(marker: Marker, center: boolean = false): void {
    if (!this.map) return;

    const leafletMarker = L.marker([marker.lat, marker.lng])
      .addTo(this.map)
      .bindPopup('Defauslt popup');

    if (center) {
      this.map.setView([marker.lat, marker.lng], this.map.getZoom());
      leafletMarker.openPopup();
    }
  }
}
