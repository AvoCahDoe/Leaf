// src/app/features/map/components/map-controls/map-controls.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-controls.html',
  styleUrls: ['./map-controls.scss']
})
export class MapControlsComponent {

  @Input() markersVisible: boolean = true;
  @Input() isManualGeoModeActive: boolean = false; // Receive state

  @Output() toggleGestion = new EventEmitter<void>();
  @Output() toggleMarkers = new EventEmitter<void>();
  @Output() centerUser = new EventEmitter<void>();
  @Output() toggleRouting = new EventEmitter<void>();
  @Output() toggleFilter = new EventEmitter<void>();
  @Output() exportMarkers = new EventEmitter<void>();
  @Output() toggleImport = new EventEmitter<void>();
  @Output() toggleManualGeo = new EventEmitter<boolean>(); // Emit desired state

  onToggleGestion() {
    this.toggleGestion.emit();
  }

  onToggleMarkers() {
    this.toggleMarkers.emit();
  }

  onCenterUser() {
    this.centerUser.emit();
  }

  onToggleRouting() {
    this.toggleRouting.emit();
  }

  onToggleFilter() {
    this.toggleFilter.emit();
  }

  onExportMarkers() {
    this.exportMarkers.emit();
  }

  onToggleImport() {
    this.toggleImport.emit();
  }

  onToggleManualGeo() {
    // Emit the desired *new* state (opposite of current)
    this.toggleManualGeo.emit(!this.isManualGeoModeActive);
  }
}
