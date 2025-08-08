import { MarkerService } from './../../../../../../core/services/marker.service';
// src/app/features/map/components/gestion-modal/components/marker-list/marker-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Marker } from '../../../../../../core/models/marker.model'; // Adjust path if needed
import { MarkerListItemComponent } from '../marker-list-item/marker-list-item';
@Component({
  selector: 'app-marker-list',
  standalone: true,
  imports: [CommonModule, MarkerListItemComponent], // Import the item component
  templateUrl: './marker-list.html',
  styleUrls: ['./marker-list.scss'],
  providers:[MarkerService]
})
export class MarkerListComponent {

  // --- Inputs ---
  /** List of all markers passed from the parent. */
  @Input() markers: Marker[] = [];

  // --- Outputs ---
  /** Emitted when the user wants to center the map on a specific marker. Payload is the marker. */
  @Output() centerOnMarker = new EventEmitter<Marker>();

  /** Emitted when the user wants to remove a marker. Payload is the marker's index in the parent's array. */
  @Output() removeMarker = new EventEmitter<number>(); // Consider emitting the marker ID instead

  /**
   * TrackBy function for the markers list to improve performance.
   * @param index The index of the marker.
   * @param marker The marker object.
   * @returns A unique identifier for the marker.
   */
  trackById(index: number, marker: Marker): string {
    return marker.id ?? `${marker.lat},${marker.lng}`;
  }

  /**
   * Handles the centerOnMarker event emitted by MarkerListItemComponent.
   * @param marker The marker to center on.
   */
  onCenterMarker(marker: Marker): void {
    this.centerOnMarker.emit(marker);
  }

  /**
   * Handles the removeMarker event emitted by MarkerListItemComponent.
   * @param index The index of the marker in the `markers` array.
   */
  onRemoveMarker(index: number): void {
    this.removeMarker.emit(index);
  }




  // ... méthodes onCenterMarker, onRemoveMarker existantes ...
}


