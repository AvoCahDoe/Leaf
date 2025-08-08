// src/app/features/map/components/routing-modal/routing-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Marker } from '../../../../core/models/marker.model';
@Component({
  selector: 'app-routing-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routing-modal.html',
  styleUrls: ['./routing-modal.scss']
})
export class RoutingModalComponent {

  // --- Inputs ---
  /** List of all markers for selection dropdowns. */
  @Input() markers: Marker[] = [];

  /** Current user location, if available. */
  @Input() userLocation: L.LatLng | null = null; // Requires L import if typed here, or use { lat: number; lng: number }

  /** Information about the currently calculated route (distance, time). */
  @Input() currentRouteInfo: { distanceKm: string; timeMin: number } | null | undefined = undefined;

  // --- Outputs ---
  /** Emitted when the user wants to calculate a route. Payload is the selected start/end IDs. */
  @Output() calculateRoute = new EventEmitter<{ startId: string; endId: string }>();

  /** Emitted when the modal should be closed. */
  @Output() closeModal = new EventEmitter<void>();

  // --- Component State ---
  /** ID of the selected starting point ('user' or marker.id). */
  selectedA: string = 'user'; // Default to user location

  /** ID of the selected destination point ('user' or marker.id). */
  selectedB: string = 'user'; // Default to user location

  /**
   * Handles the route calculation button click.
   * Emits the `calculateRoute` event with selected start/end IDs.
   */
  onCalculateRoute(): void {
    if (this.selectedA && this.selectedB) {
      this.calculateRoute.emit({ startId: this.selectedA, endId: this.selectedB });
    } else {
      alert('Veuillez sélectionner deux points valides.');
    }
  }

  /**
   * Emits the `closeModal` event to signal the parent to close this modal.
   */
  onClose(): void {
    this.closeModal.emit();
  }
}
