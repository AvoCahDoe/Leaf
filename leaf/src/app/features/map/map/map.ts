import { RoutingModalComponent } from './../components/routing-modal/routing-modal';
// src/app/features/map/map.component.ts
import { Component, AfterViewInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapControlsComponent } from '../map-controls/map-controls/map-controls';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Marker } from '../../../core/models/marker.model';
import { MarkerService } from '../../../core/services/marker.service';
import { GestionModalComponent } from "../components/gestion-modal/gestion-modal/gestion-modal";
import { MapService } from '../services/map';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { FilterModalComponent } from "../components/filter-modal/filter-modal/filter-modal";
import { ManualGeoModalComponent } from "../components/manual-geo-modal/manual-geo-modal/manual-geo-modal";

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    MapControlsComponent,
    FormsModule,
    HttpClientModule,
    GestionModalComponent,
    RoutingModalComponent,
    FilterModalComponent,
    ManualGeoModalComponent
],
  templateUrl: './map.html',
  styleUrls: ['./map.scss']
})


export class MapComponent implements AfterViewInit, OnDestroy {

  private markerService = inject(MarkerService);
  private geocodingService = inject(GeocodingService);
  private cdr = inject(ChangeDetectorRef);


  map!: L.Map;
  routingControl: L.Routing.Control | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // --- Modal Visibility States (Managed here or via a service) ---
  showGestionModal = false;
  showRoutingInputs = false;
  showFilterModal = false;
  showImportModal = false;
  showManualGeoModal = false;

  // --- State that might be shared or managed by services ---
  userLocationMarker: L.Marker | null = null;
  userLocation: L.LatLng | null = null;
  isLoading = false;
  markers: Marker[] = [];
  leafletMarkers: { [id: string]: L.Marker } = {};
  markersVisible: boolean = true;
  currentRouteInfo?: { distanceKm: string; timeMin: number };

//filter
filterName = '';
filterForm = '';
filterIce = '';
filteredMarkers: Marker[] = []; // Assuming you have this array

  constructor() {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadMarkersFromDB();
    this.setupMapResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      this.map = L.map('map').setView([34.020882, -6.841650], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    } else {
      console.error("Map container with id 'map' not found!");
    }
  }

  private setupMapResizeObserver(): void {
    const mapDiv = document.getElementById('map');
    if (mapDiv && this.map) {
      this.resizeObserver = new ResizeObserver(() => {
        this.map.invalidateSize();
      });
      this.resizeObserver.observe(mapDiv);
    }
  }

  loadMarkersFromDB(): void {
    this.isLoading = true;
    this.markerService.getMarkers().subscribe({
      next: (data) => {
        console.log('Données reçues du service:', data);
        this.markers = data;
        console.log('this.markers après affectation:', this.markers);
        for (const marker of data) {
          this.addMarkerToMap(marker);
        }
        this.isLoading = false;
        this.cdr.detectChanges();


      },
      error: (error) => {
        console.error('Error loading markers:', error);
        alert('Erreur lors du chargement des marqueurs.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }




  addMarkerToMap(marker: Marker, center: boolean = false): void {
    if (!this.map) return;

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

    const icon = marker.form && iconsMap[marker.form.toUpperCase()] ? iconsMap[marker.form.toUpperCase()] : L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
      .bindPopup(this.generatePopupContent(marker));

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
  if (marker.nombreEmployes !== undefined && marker.nombreEmployes !== null) content += `Employés: ${marker.nombreEmployes}<br/>`;
  if (marker.chiffreAffaires !== undefined && marker.chiffreAffaires !== null) content += `Chiffre d'Affaires: ${marker.chiffreAffaires} DH<br/>`;
  if (marker.dateCreation) content += `Création: ${marker.dateCreation}<br/>`; // Formatage de la date peut être nécessaire
  if (marker.identifiantBourse) content += `ID Bourse: ${marker.identifiantBourse}<br/>`;
  if (marker.nombreClientsActifs !== undefined && marker.nombreClientsActifs !== null) content += `Clients Actifs: ${marker.nombreClientsActifs}<br/>`;
  return content;
}



async handleAddMarker(markerData: Omit<Marker, 'id' | 'lat' | 'lng'> & { lat?: number | null; lng?: number | null }): Promise<void> {
  // --- Validation de base ---
  if (!markerData.name?.trim()) {
    alert('Veuillez entrer un nom pour le marqueur.');
    return;
  }
    if (!markerData.form?.trim()) {
    alert('Veuillez entrer la forme pour le marqueur.');
    return;
  }

  const validForms = ['COOPERATIVE', 'ENTREPRISE', 'ASSOCIATION'];
  const formValue = markerData.form?.toUpperCase();
  if (formValue && !validForms.includes(formValue)) {
     alert('Veuillez sélectionner un type de forme juridique valide.');
     return;
  }

  let lat = markerData.lat;
  let lng = markerData.lng;

  // --- Géocodage si les coordonnées ne sont pas fournies ---
  if (lat === null || lng === null || lat === undefined || lng === undefined) {
    if (markerData.address?.trim() && markerData.city?.trim()) {
      // Utilise GeocodingService au lieu de HttpClient direct
      try {
        const geocoded = await this.geocodingService.geocodeAddress(markerData.address, markerData.city).toPromise();
        if (!geocoded) {
          alert('Impossible de géocoder cette adresse. Veuillez entrer manuellement les coordonnées ou vérifier l\'adresse.');
          return;
        }
        lat = geocoded.lat;
        lng = geocoded.lng;
      } catch (error) {
        console.error('Geocoding error:', error);
        alert('Erreur lors du géocodage de l\'adresse.');
        return;
      }
    } else {
       alert('Veuillez soit fournir les coordonnées (lat/lng), soit une adresse et une ville pour le géocodage.');
       return;
    }
  }
  // Vérifie que lat/lng sont des nombres
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
     alert('Les coordonnées doivent être des nombres valides.');
     return;
  }
  // --- Prépare l'objet marqueur pour l'API ---

  const newMarker: Omit<Marker, 'id'> = {
    name: markerData.name.trim(),
    lat: lat,
    lng: lng,
    activity: markerData.activity?.trim() || undefined,
    address: markerData.address?.trim() || undefined,
    city: markerData.city?.trim() || undefined,
    phone: markerData.phone?.trim() || undefined,
    fax: markerData.fax?.trim() || undefined,
    email: markerData.email?.trim() || undefined,
    rc: markerData.rc?.trim() || undefined,
    ice: markerData.ice?.trim() || undefined,
    // addr_housenumber et addr_street ne sont pas dans le formulaire, les gérer ou les omettre
    addr_housenumber: '', // Ou markerData.addr_housenumber?.trim() || ''
    addr_street: '',      // Ou markerData.addr_street?.trim() || ''
    addr_postcode: markerData.addr_postcode?.trim() || undefined,
    addr_province: markerData.addr_province?.trim() || undefined,
    addr_place: markerData.addr_place?.trim() || undefined, // Assurez-vous que cette propriété existe dans votre modèle Marker
    form: formValue || undefined, // Utilise la valeur validée/majusculisée
  };

  // --- Sauvegarde dans la base de données via MarkerService ---
  this.markerService.addMarker(newMarker).subscribe({
    next: (res) => {
      // Crée l'objet marqueur complet avec l'ID reçu du backend
      const createdMarker: Marker = { ...newMarker, id: res.id };

      // Met à jour l'état local du composant
      this.markers.push(createdMarker);

      // Ajoute le marqueur à la carte Leaflet
      this.addMarkerToMap(createdMarker, true); // addToMap=true, center=true

      // alert(`Marqueur "${createdMarker.name}" ajouté avec succès !`);
    },
    error: (error) => {
      console.error('Error adding marker:', error);
      // Affiche un message d'erreur plus convivial basé sur l'erreur du service
      alert(`Erreur lors de l'ajout du marqueur : ${error.message}`);
      // Gérer l'erreur de manière appropriée (ex: afficher un message à l'utilisateur)
    }
  });
}

/**
 * Gère la suppression d'un marqueur.
 * Cette méthode est appelée lorsque GestionModalComponent émet l'événement (removeMarker).
 * @param index L'index du marqueur dans le tableau `this.markers` du composant.
 *               (Il est préférable que GestionModalComponent émette l'ID du marqueur).
 */

handleRemoveMarker(index: number): void {
  // Vérifie si l'index est valide
  if (index < 0 || index >= this.markers.length) {
    console.warn('Invalid marker index for removal:', index);
    return;
  }

  const marker = this.markers[index];

  // Vérifie que le marqueur a un ID (nécessaire pour la suppression backend)
  if (!marker.id) {
    console.error('Marker ID is missing, cannot delete from backend.');
    alert('Impossible de supprimer ce marqueur (ID manquant).');
    return;
  }

  // --- Supprime de la base de données via MarkerService ---
  this.markerService.deleteMarker(marker.id).subscribe({
    next: () => {
      // Supprime de la carte Leaflet si elle est initialisée
      if (this.map) { // 'map' est la propriété Leaflet.Map dans MapComponent
        const leafletMarker = this.leafletMarkers[marker.id!]; // 'leafletMarkers' est le tableau local
        if (leafletMarker) {
          this.map.removeLayer(leafletMarker);
        }
      }

      // Supprime du tableau local du composant
      this.markers.splice(index, 1);

      // Supprime du tableau de correspondance local
      delete this.leafletMarkers[marker.id!];

    },
    error: (error) => {
      console.error('Error deleting marker:', error);
      // Affiche un message d'erreur plus convivial basé sur l'erreur du service
      alert(`Erreur lors de la suppression du marqueur : ${error.message}`);
      // Gérer l'erreur de manière appropriée
    }
  });
}


  centerMapOnMarker(marker: Marker): void {
    if (!this.map) return;
    this.map.setView([marker.lat, marker.lng], this.map.getZoom());
    const lMarker = this.leafletMarkers[marker.id!];
    if (lMarker) lMarker.openPopup();
  }

  centerOnUserLocation(): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.userLocation = L.latLng(lat, lng);
        if (this.map) {
            this.map.setView(this.userLocation, 15);
            if (this.userLocationMarker) {
              this.map.removeLayer(this.userLocationMarker);
            }
            this.userLocationMarker = L.marker(this.userLocation, {
              icon: L.icon({
                iconUrl: 'assets/UserIcon.png',
                iconSize: [65, 65],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30],
              }),
            }).addTo(this.map).bindPopup('Vous êtes ici.').openPopup();
        }
      },
      (error) => {
        alert('Impossible d\'obtenir votre position : ' + error.message);
      }
    );
  }


  // --- Routing (Could be moved to RoutingService) ---
  drawRoute(pointAValue: string, pointBValue: string): void {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
    const getLatLng = (value: string): L.LatLng | null => {
      if (value === 'user' && this.userLocation) return this.userLocation;
      const marker = this.markers.find(m => m.id === value);
      return marker ? L.latLng(marker.lat, marker.lng) : null;
    };
    const pointA = getLatLng(pointAValue);
    const pointB = getLatLng(pointBValue);
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

  // --- Modal Toggle Methods (To be called by child components or controls) ---
  toggleGestionModal(): void {
    this.showGestionModal = !this.showGestionModal;

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  toggleRoutingInputs(): void {

    if (this.routingControl && this.map) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
      this.currentRouteInfo = undefined;    // reset lmetrics
    }

    this.showRoutingInputs = !this.showRoutingInputs;
  }

  toggleFilterModal(): void {
    this.showFilterModal = !this.showFilterModal;
    setTimeout(() => this.map?.invalidateSize(), 300);
  }



/**
 * Applies filters to markers based on name, form, and ICE.
 * Updates the `filteredMarkers` array and calls `updateMarkersVisibility`.
 */
applyFilters(): void {
  // Filter the main markers array based on current filter values
  this.filteredMarkers = this.markers.filter(marker => {
    // Filter by name (case insensitive partial match)
    const nameMatch = !this.filterName || marker.name.toLowerCase().includes(this.filterName.toLowerCase());

    // Filter by form (case insensitive exact match)
    const formMatch = !this.filterForm || (marker.form && marker.form.toLowerCase() === this.filterForm.toLowerCase());

    // Filter by ICE (case insensitive partial match)
    const iceMatch = !this.filterIce || (marker.ice && marker.ice.toLowerCase().includes(this.filterIce.toLowerCase()));

    // All conditions must be true (AND logic)
    return nameMatch && formMatch && iceMatch;
  });

  // Update the map display based on the new filtered list
  this.updateMarkersVisibility();
}
onFiltersChange(name: string, form: string, ice: string): void {
  // Update the local filter state properties
  this.filterName = name;
  this.filterForm = form;
  this.filterIce = ice;

  // Apply the filters to update the filteredMarkers array and map visibility
  // This reuses the existing applyFilters logic
  this.applyFilters();

}
/**
 * Updates markers visibility on the map based on current filters and overall visibility toggle.
 * This method determines which markers (all or filtered) should be shown.
 */
updateMarkersVisibility(): void {
  if (!this.map) return; // Ensure map is initialized

  // Hide all markers first by removing them from the map layer
  Object.values(this.leafletMarkers).forEach(marker => {
    this.map.removeLayer(marker);
  });

  const markersToShow = (this.filterName || this.filterForm || this.filterIce) ? this.filteredMarkers : this.markers;

  if (this.markersVisible) {
    markersToShow.forEach(marker => {
      // Safety check: ensure the marker exists in our leafletMarkers map and has an ID
      if (marker.id && this.leafletMarkers[marker.id]) {
        this.map.addLayer(this.leafletMarkers[marker.id]);
      }
    });
  }

}

/**
 * Clears all filters and shows all markers.
 * Resets filter input values and updates the display.
 */
clearFilters(): void {
  this.filterName = '';
  this.filterForm = '';
  this.filterIce = '';
  this.filteredMarkers = []; // Clear the filtered list
  this.updateMarkersVisibility();
}

/**
 * Gets the count of markers currently displayed after filtering.
 * Used for displaying results in the filter modal.
 * @returns The number of filtered markers, or total markers if no filter is active.
 */

getFilteredMarkersCount(): number {
  // If any filter is active, return the count of filtered markers
  if (this.filterName || this.filterForm || this.filterIce) {
    return this.filteredMarkers.length;
  }
  // Otherwise, return the total count of markers
  return this.markers.length;
}



  // --- Utility ---
  trackById(index: number, marker: Marker): string {
    return marker.id ?? `${marker.lat},${marker.lng}`;
  }
}
