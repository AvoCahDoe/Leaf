import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MapControlItem {
  id: string;
  label: string;
  icon: 'gestion' | 'location' | 'route' | 'filter' | 'export' | 'import' | 'geo';
  active?: boolean;
}

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-controls.html',
  styleUrls: ['./map-controls.scss'],
})
export class MapControlsComponent {
  @Input() isManualGeoModeActive = false;
  @Input() isGestionOpen = false;
  @Input() isRoutingOpen = false;
  @Input() isFilterOpen = false;
  @Input() isImportOpen = false;

  @Output() toggleGestion = new EventEmitter<void>();
  @Output() centerUser = new EventEmitter<void>();
  @Output() toggleRouting = new EventEmitter<void>();
  @Output() toggleFilter = new EventEmitter<void>();
  @Output() exportMarkers = new EventEmitter<void>();
  @Output() toggleImport = new EventEmitter<void>();
  @Output() toggleManualGeo = new EventEmitter<boolean>();

  get controls(): MapControlItem[] {
    return [
      { id: 'gestion', label: 'Marqueurs', icon: 'gestion', active: this.isGestionOpen },
      { id: 'location', label: 'Ma position', icon: 'location' },
      { id: 'route', label: 'Itinéraire', icon: 'route', active: this.isRoutingOpen },
      { id: 'filter', label: 'Filtrer', icon: 'filter', active: this.isFilterOpen },
      { id: 'export', label: 'Exporter', icon: 'export' },
      { id: 'import', label: 'Importer', icon: 'import', active: this.isImportOpen },
      { id: 'geo', label: this.isManualGeoModeActive ? 'Arrêter' : 'Géo manuelle', icon: 'geo', active: this.isManualGeoModeActive },
    ];
  }

  onControlClick(id: string): void {
    switch (id) {
      case 'gestion':
        this.toggleGestion.emit();
        break;
      case 'location':
        this.centerUser.emit();
        break;
      case 'route':
        this.toggleRouting.emit();
        break;
      case 'filter':
        this.toggleFilter.emit();
        break;
      case 'export':
        this.exportMarkers.emit();
        break;
      case 'import':
        this.toggleImport.emit();
        break;
      case 'geo':
        this.toggleManualGeo.emit(!this.isManualGeoModeActive);
        break;
    }
  }
}
