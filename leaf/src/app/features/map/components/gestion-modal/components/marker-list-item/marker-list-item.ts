// src/app/features/map/components/gestion-modal/components/marker-list-item/marker-list-item.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Marker } from '../../../../../../core/models/marker.model'; // Adjust path if needed

@Component({
  selector: 'app-marker-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marker-list-item.html',
  styleUrls: ['./marker-list-item.scss']
})
export class MarkerListItemComponent {

  // --- Inputs ---
  /** The marker data for this item. */
  @Input() marker!: Marker; // Use definite assignment assertion as it's required

  /** The index of this marker in the parent's array. */
  @Input() index!: number; // Use definite assignment assertion as it's required

  // --- Outputs ---
  /** Emitted when the user wants to center the map on this marker. Payload is the marker. */
  @Output() centerOnMarker = new EventEmitter<Marker>();

  /** Emitted when the user wants to remove this marker. Payload is the marker's index. */
  @Output() removeMarker = new EventEmitter<number>();




  /**
   * Emits the `centerOnMarker` event for this marker.
   */
  onCenterClick(): void {
    this.centerOnMarker.emit(this.marker);
  }

  /**
   * Emits the `removeMarker` event for this marker's index.
   */
  onRemoveClick(): void {
    this.removeMarker.emit(this.index);
  }
}
