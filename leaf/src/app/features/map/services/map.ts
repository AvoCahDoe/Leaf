// src/app/features/map/services/map.service.ts
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Marker } from '../../../core/models/marker.model';

@Injectable({
  providedIn: 'root' // Or provide in MapComponent if it's only used there
})
export class MapService {

  private map: L.Map | null = null;
  private leafletMarkers: { [id: string]: L.Marker } = {};
  private routingControl: L.Routing.Control | null = null;

  constructor() { }

  /**
   * Initializes the Leaflet map instance.
   * @param mapContainerId The ID of the HTML element to attach the map to.
   * @param initialViewCenter The initial center coordinates [lat, lng].
   * @param initialZoom The initial zoom level.
   */
  initializeMap(mapContainerId: string, initialViewCenter: L.LatLngExpression, initialZoom: number): L.Map {
    if (this.map) {
      console.warn('Map already initialized.');
      return this.map;
    }

    this.map = L.map(mapContainerId).setView(initialViewCenter, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    return this.map;
  }

  /**
   * Gets the current Leaflet map instance.
   * @returns The Leaflet map instance or null if not initialized.
   */
  getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Adds a marker to the Leaflet map.
   * @param marker The Marker data.
   * @param icon Optional custom Leaflet icon.
   * @param addToMap Whether to immediately add the marker to the map. Defaults to true.
   * @param center Whether to center the map on the new marker. Defaults to false.
   * @returns The created Leaflet Marker object.
   */


  addMarkerToMap(marker: Marker, icon?: L.Icon, addToMap: boolean = true, center: boolean = false): L.Marker {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    const defaultIcon = L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const iconsMap: Record<string, L.Icon> = {
      COOPERATIVE: L.icon({
        iconUrl: 'assets/blue.png',
        shadowUrl: 'assets/leaf-shadow.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      }),
      ENTREPRISE: L.icon({
        iconUrl: 'assets/yellow.png',
        shadowUrl: 'assets/leaf-shadow.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      }),
      ASSOCIATION: L.icon({
        iconUrl: 'assets/red.png',
        shadowUrl: 'assets/leaf-shadow.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      }),
    };

    const finalIcon = icon || (marker.form && iconsMap[marker.form.toUpperCase()] ? iconsMap[marker.form.toUpperCase()] : defaultIcon);

    const leafletMarker = L.marker([marker.lat, marker.lng], { icon: finalIcon })
      .bindPopup(this.generatePopupContent(marker));

    if (addToMap) {
      leafletMarker.addTo(this.map);
    }

    if (marker.id) {
      this.leafletMarkers[marker.id] = leafletMarker;
    }

    if (center) {
      this.map.setView([marker.lat, marker.lng], this.map.getZoom());
      leafletMarker.openPopup();
    }

    return leafletMarker;
  }

  /**
   * Generates HTML content for a marker's popup.
   * @param marker The marker data.
   * @returns HTML string for the popup content.
   */

  generatePopupContent(marker: Marker): string {
    let content = `<strong>${marker.name}</strong><br/>`;
    if (marker.activity) content += `Activité: ${marker.activity}<br/>`;
    if (marker.address) content += `Adresse: ${marker.address}<br/>`;
    if (marker.city) content += `Ville: ${marker.city}<br/>`;
    if (marker.phone) content += `Téléphone: ${marker.phone}<br/>`;
    if (marker.addr_postcode) content += `Code Postal: ${marker.addr_postcode}<br/>`;
    if (marker.addr_province) content += `Province: ${marker.addr_province}<br/>`;
    if (marker.addr_place) content += `Lieu-dit: ${marker.addr_place}<br/>`;
    if (marker.fax) content += `Fax: ${marker.fax}<br/>`;
    if (marker.email) content += `Email: ${marker.email}<br/>`;
    if (marker.rc) content += `RC: ${marker.rc}<br/>`;
    if (marker.ice) content += `ICE: ${marker.ice}<br/>`;
    if (marker.form) content += `Forme: ${marker.form}<br/>`;
    return content;
  }

  /**
   * Centers the map view on a specific marker.
   * @para
   * m marker The marker data.
   */
  centerMapOnMarker(marker: Marker): void {
    if (!this.map) return;
    this.map.setView([marker.lat, marker.lng], this.map.getZoom());
    const lMarker = this.leafletMarkers[marker.id!];
    if (lMarker) lMarker.openPopup();
  }

  /**
   * Removes a marker from the Leaflet map by its ID.
   * @param markerId The ID of the marker to remove.
   */
  removeMarkerFromMap(markerId: string): void {
    if (!this.map) return;
    const lMarker = this.leafletMarkers[markerId];
    if (lMarker) {
      this.map.removeLayer(lMarker);
      delete this.leafletMarkers[markerId];
    }
  }

  // /**
  //  * Updates the visibility of all markers on the map.
  //  * @param visible Whether markers should be visible.
  //  */
  // updateMarkersVisibility(visible: boolean): void {
  //   if (!this.map) return;
  //   Object.values(this.leafletMarkers).forEach(marker => {
  //     if (visible) {
  //       marker.addTo(this.map!); // '!' because we checked map above
  //     } else {
  //       this.map!.removeLayer(marker);
  //     }
  //   });
  // }

  /**
   * Draws a route between two points using Leaflet Routing Machine.
   * @param pointA The starting L.LatLng.
   * @param pointB The ending L.LatLng.
   * @param onRouteFound Callback function executed when the route is found, providing distance and time.
   */
  drawRoute(pointA: L.LatLng, pointB: L.LatLng, onRouteFound?: (distanceKm: string, timeMin: number) => void): void {
    if (!this.map) {
      console.error('Map not initialized.');
      return;
    }

    // Remove existing route before initiating
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }

    this.routingControl = L.Routing.control({
      waypoints: [pointA, pointB],
      routeWhileDragging: false,
      show: false,  //hide routing panel UI
      // You can add more LRM options here if needed
    }).addTo(this.map);

    const container = this.routingControl.getContainer();
    if (container) container.style.display = 'none';

  }

  /**
   * Clears the currently drawn route.
   */
  clearRoute(): void {
    if (this.map && this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
  }

  /**
   * Adds a temporary marker (e.g., for manual geolocation) to the map.
   * @param latLng The coordinates for the marker.
   * @param icon Optional custom icon.
   * @returns The created Leaflet Marker object.
   */

  /**
   * Adds a user location marker to the map.
   * @param latLng The user's coordinates.
   * @returns The created Leaflet Marker object.
   */


  addUserLocationMarker(latLng: L.LatLng): L.Marker {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    const userIcon = L.icon({
      iconUrl: 'assets/UserIcon.png', // Ensure this asset exists
      iconSize: [65, 65],
      iconAnchor: [15, 30], // Adjust based on your icon
      popupAnchor: [0, -30],
    });

    const userMarker = L.marker(latLng, { icon: userIcon }).addTo(this.map).bindPopup('Vous êtes ici.').openPopup();
    return userMarker;
  }

  /**
   * Cleans up resources when the map component is destroyed.
   * Removes the map instance and clears internal marker references.
   */
  destroy(): void {
    if (this.map) {
      this.map.remove(); // Properly remove the map instance
      this.map = null;
    }
    this.leafletMarkers = {};
    this.routingControl = null;
  }
}
