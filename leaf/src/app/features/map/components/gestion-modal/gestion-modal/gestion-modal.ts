// src/app/features/map/components/gestion-modal/gestion-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Marker } from '../../../../../core/models/marker.model';
import { MarkerFormComponent } from './../components/marker-form/marker-form';
import { MarkerListComponent } from '../components/marker-list/marker-list';
@Component({
  selector: 'app-gestion-modal',
  standalone: true,
  imports: [
    CommonModule,
    MarkerFormComponent, // Importer le sous-composant
    MarkerListComponent  // Importer le sous-composant
  ],
  templateUrl: './gestion-modal.html',
  styleUrls: ['./gestion-modal.scss']
})
export class GestionModalComponent {

  // --- Inputs ---
  /** Liste des marqueurs existants passée par le parent. */
  @Input() markers: Marker[] =[];

  // --- Outputs ---
  /** Émis lorsque l'utilisateur souhaite ajouter un nouveau marqueur.
   *  La charge utile est les données du nouveau marqueur.
   */
  @Output() addMarker = new EventEmitter<Omit<Marker, 'id' | 'lat' | 'lng'> & { lat?: number | null; lng?: number | null }>();

  /** Émis lorsque l'utilisateur souhaite centrer la carte sur un marqueur spécifique.
   *  La charge utile est le marqueur.
   */
  @Output() centerOnMarker = new EventEmitter<Marker>();

  /** Émis lorsque l'utilisateur souhaite supprimer un marqueur.
   *  La charge utile est l'index du marqueur dans le tableau du parent.
   *  (Considérer l'émission de l'ID du marqueur pour plus de robustesse).
   */
  @Output() removeMarker = new EventEmitter<number>();

  /** Émis lorsque le modal doit être fermé. */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Gère l'événement addMarker émis par MarkerFormComponent.
   * @param markerData Les données du nouveau marqueur.
   */
  onAddMarker(markerData: Omit<Marker, 'id' | 'lat' | 'lng'> & { lat?: number | null; lng?: number | null }) {
    this.addMarker.emit(markerData);
  }

  /**
   * Gère l'événement centerOnMarker émis par MarkerListComponent.
   * @param marker Le marqueur à centrer.
   */
  onCenterOnMarker(marker: Marker) {
    this.centerOnMarker.emit(marker);
  }

  /**
   * Gère l'événement removeMarker émis par MarkerListComponent.
   * @param index L'index du marqueur à supprimer.
   */
  onRemoveMarker(index: number) {
    this.removeMarker.emit(index);
  }

  /**
   * Émet l'événement closeModal pour signaler au parent de fermer ce modal.
   */
  onClose() {
    this.closeModal.emit();
  }

  test(){
    console.log(this.markers)
  }




}
