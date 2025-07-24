import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

interface Marker {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  activity?: string;
  address?: string;
  city?: string;
  phone?: string;
  fax?: string;
  email?: string;
  rc?: string;
  ice?: string;
  form?: string;
  addr_housenumber?: string;
  addr_street?: string;
  addr_postcode?: string;
  addr_province?: string;
  addr_place?: string;
}

@Component({
  selector: 'app-cart-map',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './map.html',
  styleUrls: ['./map.scss']
})
export class CartMapComponent implements AfterViewInit {
  map!: L.Map;
  routingControl: any;

  showGestionModal = false;
  showRoutingInputs = false;

  // Form data
  newLatitude: number | null = null;
  newLongitude: number | null = null;
  newMarkerName = '';
  newActivity = '';
  newAddress = '';
  newCity = '';
  newPhone = '';
  newFax = '';
  newEmail = '';
  newRc = '';
  newIce = '';
  newForm = '';
  newPostcode = '';
  newProvince = '';
  newPlace = '';

  selectedA: string = '';
  selectedB: string = '';
  userLocation: L.LatLng | null = null;

  isLoading = false;
  markers: Marker[] = [];
  leafletMarkers: { [id: string]: L.Marker } = {};

  currentRouteInfo?: { distanceKm: string; timeMin: number };

  private apiUrl = 'http://localhost:5000/markers';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadMarkersFromDB();

    const mapDiv = document.getElementById('map');
    if (mapDiv) {
      const resizeObserver = new ResizeObserver(() => {
        this.map.invalidateSize();
      });
      resizeObserver.observe(mapDiv);
    }
  }

  toggleGestionModal(): void {
    this.showGestionModal = !this.showGestionModal;
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  toggleRoutingInputs(): void {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
      this.currentRouteInfo = undefined;
    }

    this.showRoutingInputs = !this.showRoutingInputs;
  }

  private initMap(): void {
    this.map = L.map('map').setView([34.020882, -6.841650], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  loadMarkersFromDB(): void {
    this.isLoading = true;
    this.http.get<Marker[]>(this.apiUrl).subscribe((data) => {
      this.markers = data;
      for (const marker of data) {
        this.addMarkerToMap(marker);
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  async addMarker(): Promise<void> {
    const validForms = ['COOPERATIVE', 'ENTREPRISE', 'ASSOCIATION'];
    if (!validForms.includes(this.newForm.toUpperCase())) {
      alert('Veuillez sélectionner un type de form valide.');
      return;
    }

    let lat = this.newLatitude;
    let lng = this.newLongitude;

    if (lat === null || lng === null) {
      const geocoded = await this.geocodeAddress(this.newAddress, this.newCity);
      if (!geocoded) {
        alert('Impossible de géocoder cette adresse. Veuillez entrer manuellement les coordonnées.');
        return;
      }
      lat = geocoded.lat;
      lng = geocoded.lng;
    }

    const newMarker: Marker = {
      name: this.newMarkerName,
      lat,
      lng,
      activity: this.newActivity,
      address: this.newAddress,
      city: this.newCity,
      phone: this.newPhone,
      fax: this.newFax,
      email: this.newEmail,
      rc: this.newRc,
      ice: this.newIce,
      addr_housenumber: '',
      addr_street: '',
      addr_postcode: this.newPostcode,
      addr_province: this.newProvince,
      addr_place: this.newPlace,
      form: this.newForm.toUpperCase(),
    };

    this.http.post<{ id: string }>(this.apiUrl, newMarker).subscribe((res) => {
      const createdMarker: Marker = { ...newMarker, id: res.id };
      this.markers.push(createdMarker);
      this.addMarkerToMap(createdMarker, true);
      this.cdr.detectChanges();

      // Reset form
      this.newLatitude = null;
      this.newLongitude = null;
      this.newMarkerName = '';
      this.newActivity = '';
      this.newAddress = '';
      this.newCity = '';
      this.newPhone = '';
      this.newFax = '';
      this.newEmail = '';
      this.newRc = '';
      this.newIce = '';
      this.newForm = '';
    });
  }

  addMarkerToMap(marker: Marker, center: boolean = false): void {
    const iconsMap: Record<string, L.Icon> = {
      COOPERATIVE: L.icon({ iconUrl: 'assets/blue.png', shadowUrl: 'assets/leaf-shadow.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
      ENTREPRISE: L.icon({ iconUrl: 'assets/yellow.png', shadowUrl: 'assets/leaf-shadow.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
      ASSOCIATION: L.icon({ iconUrl: 'assets/red.png', shadowUrl: 'assets/leaf-shadow.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
    };

    const icon = marker.form && iconsMap[marker.form.toUpperCase()] ? iconsMap[marker.form.toUpperCase()] : L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
      .addTo(this.map)
      .bindPopup(this.generatePopupContent(marker));

    if (marker.id) {
      this.leafletMarkers[marker.id] = leafletMarker;
    }

    if (center) {
      this.map.setView([marker.lat, marker.lng], this.map.getZoom());
      leafletMarker.openPopup();
    }
  }

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

  centerMapOnMarker(marker: Marker): void {
    this.map.setView([marker.lat, marker.lng], this.map.getZoom());
    const lMarker = this.leafletMarkers[marker.id!];
    if (lMarker) lMarker.openPopup();
  }

  removeMarker(index: number): void {
    const marker = this.markers[index];
    if (!marker.id) return;

    this.http.delete(`${this.apiUrl}/${marker.id}`).subscribe(() => {
      this.map.removeLayer(this.leafletMarkers[marker.id!]);
      this.markers.splice(index, 1);
      delete this.leafletMarkers[marker.id!];
      this.cdr.detectChanges();
    });
  }

  trackById(index: number, marker: Marker): string {
    return marker.id ?? `${marker.lat},${marker.lng}`;
  }

  centerOnUserLocation(): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation n’est pas supportée par votre navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.userLocation = L.latLng(lat, lng);
        this.map.setView(this.userLocation, 15);

        L.marker(this.userLocation, {
          icon: L.icon({
            iconUrl: 'assets/UserIcon.png',
            iconSize: [65, 65],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
          }),
        }).addTo(this.map).bindPopup('Vous êtes ici.').openPopup();
      },
      (error) => {
        alert('Impossible d’obtenir votre position : ' + error.message);
      }
    );
  }

  drawRoute(): void {
    //remove existing route before initiating
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }

    const getLatLng = (value: string): L.LatLng | null => {
      if (value === 'user' && this.userLocation) return this.userLocation;
      const marker = this.markers.find(m => m.id === value);
      return marker ? L.latLng(marker.lat, marker.lng) : null;
    };

    const pointA = getLatLng(this.selectedA);
    const pointB = getLatLng(this.selectedB);

    if (pointA && pointB) {
      this.routingControl = L.Routing.control({
        waypoints: [pointA, pointB],
        routeWhileDragging: false,
        addWaypoints: false,
        show: false
      }).addTo(this.map);

      const container = this.routingControl.getContainer();
      if (container) container.style.display = 'none';

      this.routingControl.on('routesfound', (e: any) => {
        const route = e.routes[0];
        const summary = route.summary;
        const distanceKm = (summary.totalDistance / 1000).toFixed(2);
        const timeMin = Math.round(summary.totalTime / 60);
        this.currentRouteInfo = { distanceKm, timeMin };
        this.cdr.detectChanges();
      });
    } else {
      alert('Veuillez sélectionner deux points valides.');
    }
  }

  geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
    const fullAddress = `${address}, ${city}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;

    return this.http.get<any[]>(url, {
      headers: { 'Accept-Language': 'fr', 'User-Agent': 'MyMapApp/1.0' }
    }).toPromise().then((data) => {
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      } else {
        return null;
      }
    }).catch(() => null);
  }
}
