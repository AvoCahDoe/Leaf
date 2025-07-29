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
  showFilterModal = false; //filter modal

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
  markersVisible: boolean = true;

  // Filter props
  filterName = '';
  filterForm = '';
  filterIce = '';
  filteredMarkers: Marker[] = [];


  showImportModal = false;
importFile: File | null = null;
importPreview: Marker[] = [];
importStats = { total: 0, valid: 0, invalid: 0 };

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


  //  * Toggle filter modal visibility

  toggleFilterModal(): void {
    this.showFilterModal = !this.showFilterModal;
    setTimeout(() => this.map.invalidateSize(), 300);
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
      this.filteredMarkers = []; // Initialize filtered markers
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

      // Reapply filters if any are active
      if (this.filterName || this.filterForm || this.filterIce) {
        this.applyFilters();
      }

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
      .bindPopup(this.generatePopupContent(marker));

    // Only add to map if markers are visible
    if (this.markersVisible) {
      leafletMarker.addTo(this.map);
    }

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

      // Reapply filters if any are active
      if (this.filterName || this.filterForm || this.filterIce) {
        this.applyFilters();
      }

      this.cdr.detectChanges();
    });
  }

  trackById(index: number, marker: Marker): string {
    return marker.id ?? `${marker.lat},${marker.lng}`;
  }

  centerOnUserLocation(): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation nest pas supportée par votre navigateur.');
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
        alert('Impossible dobtenir votre position : ' + error.message);
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

  toggleMarkersVisibility(): void {
    this.markersVisible = !this.markersVisible;

    Object.values(this.leafletMarkers).forEach(marker => {
      if (this.markersVisible) {
        marker.addTo(this.map);
      } else {
        this.map.removeLayer(marker);
      }
    });

    this.cdr.detectChanges();
  }


  //  * Apply filters to markers based on name, form, and ICE

  applyFilters(): void {
    this.filteredMarkers = this.markers.filter(marker => {
      // Filter by name (case insensitive)
      const nameMatch = !this.filterName ||
        marker.name.toLowerCase().includes(this.filterName.toLowerCase());

      // Filter by form (exact match)
      const formMatch = !this.filterForm ||
        marker.form?.toUpperCase() === this.filterForm.toUpperCase();

      // Filter by ICE (case insensitive partial match)
      const iceMatch = !this.filterIce ||
        (marker.ice && marker.ice.toLowerCase().includes(this.filterIce.toLowerCase()));

      return nameMatch && formMatch && iceMatch;
    });

    // Update markers visibility on map
    this.updateMarkersVisibility();
  }

  //  * Update markers visibility on the map based on filters

  updateMarkersVisibility(): void {
    // Hide all markers first
    Object.values(this.leafletMarkers).forEach(marker => {
      this.map.removeLayer(marker);
    });

    // Show only filtered markers if filters are activeotherwise show all
    const markersToShow = (this.filterName || this.filterForm || this.filterIce) ?
      this.filteredMarkers : this.markers;

    markersToShow.forEach(marker => {
      if (marker.id && this.leafletMarkers[marker.id] && this.markersVisible) {
        this.map.addLayer(this.leafletMarkers[marker.id]);
      }
    });
  }


  //  * Clear all filters and show all markers

  clearFilters(): void {
    this.filterName = '';
    this.filterForm = '';
    this.filterIce = '';
    this.filteredMarkers = [];

    // Show all markers
    this.updateMarkersVisibility();
  }

  //  * Get count of filtered markers for display
  getFilteredMarkersCount(): number {
    if (this.filterName || this.filterForm || this.filterIce) {
      return this.filteredMarkers.length;
    }
    return this.markers.length;
  }






exportMarkers(): void {
  // Transform markers to the desired format
  const exportData = this.markers.map(marker => ({
    name: marker.name,
    form: marker.form || '',
    activity: marker.activity || '',
    address: marker.address || '',
    addr_province: marker.addr_province || '',
    addr_postcode: marker.addr_postcode || '',
    city: marker.city || ''
  }));


 const jsonContent = `const markers: Marker[] = ${JSON.stringify(exportData, null, 2)};`;
  // Create and download the file
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `markers_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  alert(`${this.markers.length} marqueurs exportés avec succès !`);
}






//  Toggle import modal visibility

toggleImportModal(): void {
  this.showImportModal = !this.showImportModal;
  if (!this.showImportModal) {
    // Reset import state when closing
    this.importFile = null;
    this.importPreview = [];
    this.importStats = { total: 0, valid: 0, invalid: 0 };
  }
  setTimeout(() => this.map.invalidateSize(), 300);
}

  // Handle file selection for import

onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
    this.importFile = file;
    this.previewImportFile(file);
  } else {
    alert('Veuillez sélectionner un fichier JSON valide.');
    event.target.value = '';
  }
}


  // Preview the import file content

private previewImportFile(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      let markersData: Marker[];

      // Try to parse as direct JSON array first
      try {
        markersData = JSON.parse(content);
      } catch {
        // try to extract from TypeScript const declaration
        const match = content.match(/const\s+\w+\s*:\s*\w+\[\]\s*=\s*(\[[\s\S]*\]);?/);
        if (match) {
          markersData = JSON.parse(match[1]);
        } else {
          throw new Error('Format non reconnu');
        }
      }

      if (!Array.isArray(markersData)) {
        throw new Error('Le fichier doit contenir un tableau de marqueurs');
      }

      this.importPreview = [];
      this.importStats = { total: markersData.length, valid: 0, invalid: 0 };

      markersData.forEach((marker, index) => {
        if (this.validateImportMarker(marker)) {
          // Add default coordinates (will be geocoded during import)
          const validMarker: Marker = {
            name: marker.name || `Marqueur ${index + 1}`,
            form: marker.form?.toUpperCase() || 'ENTREPRISE',
            activity: marker.activity || '',
            address: marker.address || '',
            addr_province: marker.addr_province || '',
            addr_postcode: marker.addr_postcode || '',
            city: marker.city || '',
            lat: 0, // Will be geocoded
            lng: 0, // Will be geocoded
            phone: marker.phone || '',
            fax: marker.fax || '',
            email: marker.email || '',
            rc: marker.rc || '',
            ice: marker.ice || ''
          };
          this.importPreview.push(validMarker);
          this.importStats.valid++;
        } else {
          this.importStats.invalid++;
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      alert('Erreur lors de la lecture du fichier: ' + (error as Error).message);
      this.importFile = null;
    }
  };
  reader.readAsText(file);
}

//  * Validate a marker from import file
private validateImportMarker(marker: any): boolean {
  return marker &&
         typeof marker.name === 'string' &&
         marker.name.trim().length > 0;
}


//  * Import markers to database

async importMarkers(): Promise<void> {
  if (this.importPreview.length === 0) {
    alert('Aucun marqueur valide à importer.');
    return;
  }

  this.isLoading = true;
  let successCount = 0;
  let errorCount = 0;

  for (const marker of this.importPreview) {
    try {
      // Try to geocode the address
      if (marker.address && marker.city) {
        const geocoded = await this.geocodeAddress(marker.address, marker.city);
        if (geocoded) {
          marker.lat = geocoded.lat;
          marker.lng = geocoded.lng;
        } else {
          // Use default coordinates for Morocco if geocoding fails
          marker.lat = 31.7917;
          marker.lng = -7.0926;
        }
      } else {
        // Use default coordinates for Morocco
        marker.lat = 31.7917;
        marker.lng = -7.0926;
      }

      // Save to database
      const response = await this.http.post<{ id: string }>(this.apiUrl, marker).toPromise();
      if (response?.id) {
        const createdMarker: Marker = { ...marker, id: response.id };
        this.markers.push(createdMarker);
        this.addMarkerToMap(createdMarker);
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation du marqueur:', marker.name, error);
      errorCount++;
    }
  }

  this.isLoading = false;
  this.cdr.detectChanges();

  // Show import results
  let message = `Importation terminée:\n`;
  message += `✓ ${successCount} marqueurs importés avec succès\n`;
  if (errorCount > 0) {
    message += `✗ ${errorCount} marqueurs ont échoué`;
  }
  alert(message);

  // Close and reset
  this.toggleImportModal();
}









}
