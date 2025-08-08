// src/app/features/map/components/gestion-modal/components/marker-form/marker-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Marker } from '../../../../../../core/models/marker.model'; // Adjust path if needed

@Component({
  selector: 'app-marker-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marker-form.html',
  styleUrls: ['./marker-form.scss']
})
export class MarkerFormComponent {

  // --- Outputs ---
  /** Emitted when the user wants to add a new marker. Payload is the new marker data. */
  @Output() addMarker = new EventEmitter<Omit<Marker, 'id' | 'lat' | 'lng'> & { lat?: number | null; lng?: number | null }>();

  // --- Form Data Properties ---
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
  newPlace = ''; // addr_place

    newNombreEmployes: number | null = null;
  newChiffreAffaires: number | null = null;
  newDateCreation: string = ''; // ou newDateCreation: Date | null = null;
  newIdentifiantBourse = '';
  newNombreClientsActifs: number | null = null;
  /**
   * Handles the form submission for adding a new marker.
   * Emits the `addMarker` event with the form data.
   */
  onSubmit(): void {
    // Basic validation for required fields could be added here
    if (!this.newMarkerName.trim()) {
      alert('Veuillez entrer un nom pour le marqueur.');
      return;
    }

    const validForms = ['COOPERATIVE', 'ENTREPRISE', 'ASSOCIATION'];
    if (this.newForm && !validForms.includes(this.newForm.toUpperCase())) {
       alert('Veuillez sélectionner un type de forme juridique valide.');
       return;
    }

const markerData: Omit<Marker, 'id' | 'lat' | 'lng'> & { lat?: number | null; lng?: number | null } = {
      name: this.newMarkerName.trim(),
      activity: this.newActivity.trim() || undefined,
      address: this.newAddress.trim() || undefined,
      city: this.newCity.trim() || undefined,
      phone: this.newPhone.trim() || undefined,
      fax: this.newFax.trim() || undefined,
      email: this.newEmail.trim() || undefined,
      rc: this.newRc.trim() || undefined,
      ice: this.newIce.trim() || undefined,
      form: this.newForm.trim() ? this.newForm.toUpperCase() : undefined,
      addr_postcode: this.newPostcode.trim() || undefined,
      addr_province: this.newProvince.trim() || undefined,
      addr_place: this.newPlace.trim() || undefined,
      lat: this.newLatitude,
      lng: this.newLongitude,
      // --- Ajout des nouvelles données ---
      nombreEmployes: this.newNombreEmployes ?? undefined,
      chiffreAffaires: this.newChiffreAffaires ?? undefined,
      dateCreation: this.newDateCreation || undefined, // Gérer le format date si nécessaire
      identifiantBourse: this.newIdentifiantBourse.trim() || undefined,
      nombreClientsActifs: this.newNombreClientsActifs ?? undefined,
      // -------------------------------
      addr_housenumber: '', // ou valeur par défaut si utilisé
      addr_street: '',      // ou valeur par défaut si utilisé
    };

    this.addMarker.emit(markerData);
    // Reset form fields after emitting
    this.resetForm();
  }

  /**
   * Resets the form fields to their initial state.
   */
  private resetForm(): void {
    // ... réinitialisation des champs existants ...
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
    this.newPostcode = '';
    this.newProvince = '';
    this.newPlace = '';

    // --- Réinitialisation des nouveaux champs ---
    this.newNombreEmployes = null;
    this.newChiffreAffaires = null;
    this.newDateCreation = '';
    this.newIdentifiantBourse = '';
    this.newNombreClientsActifs = null;
    // -----------------------------------------
  }
}
