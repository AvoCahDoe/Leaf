import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPanelComponent } from '../../../../../core/components/modal-panel/modal-panel';

@Component({
  selector: 'app-manual-geo-modal',
  standalone: true,
  imports: [CommonModule, ModalPanelComponent],
  templateUrl: './manual-geo-modal.html',
  styleUrls: ['./manual-geo-modal.scss'],
})
export class ManualGeoModalComponent {
  @Input() visible = false;
  @Input() clickedCoordinates: { lat: number; lng: number } | null = null;
  @Input() clickedAddress = '';

  @Output() copyCoordinates = new EventEmitter<void>();
  @Output() useCoordinates = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  onCopyCoordinates(): void {
    this.copyCoordinates.emit();
  }

  onUseCoordinates(): void {
    this.useCoordinates.emit();
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
