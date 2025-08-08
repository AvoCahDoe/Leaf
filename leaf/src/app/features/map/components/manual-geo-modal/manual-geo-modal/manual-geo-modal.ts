// src/app/features/map/components/manual-geo-modal/manual-geo-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manual-geo-modal',
  standalone: true,
  imports: [CommonModule], // FormsModule not needed if no ngModel
  templateUrl: './manual-geo-modal.html',
  styleUrls: ['./manual-geo-modal.scss']
})
export class ManualGeoModalComponent {

  // --- Inputs ---
  /** The coordinates clicked by the user. */
  @Input() clickedCoordinates: { lat: number; lng: number } | null = null;

  /** The address reverse-geocoded from the clicked coordinates. */
  @Input() clickedAddress: string = '';

  // --- Outputs ---
  /** Emitted when the user wants to copy the coordinates. */
  @Output() copyCoordinates = new EventEmitter<void>();

  /** Emitted when the user wants to use the coordinates for a new marker. */
  @Output() useCoordinates = new EventEmitter<void>();

  /** Emitted when the modal should be closed. */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Emits the `copyCoordinates` event to signal the parent to copy coordinates.
   */
  onCopyCoordinates(): void {
    this.copyCoordinates.emit();
  }

  /**
   * Emits the `useCoordinates` event to signal the parent to use coordinates.
   */
  onUseCoordinates(): void {
    this.useCoordinates.emit();
  }

  /**
   * Emits the `closeModal` event to signal the parent to close this modal.
   */
  onClose(): void {
    this.closeModal.emit();
  }
}
