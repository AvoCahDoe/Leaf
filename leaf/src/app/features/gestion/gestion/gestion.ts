import { ChangeDetectorRef } from '@angular/core';
// src/app/features/gestion/gestion.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { RouterModule } from '@angular/router'; // If routerLink is used in the template
import { Marker } from '../../../core/models/marker.model';
import { MarkerService } from '../../../core/services/marker.service';
import { Subscription } from 'rxjs'; // To manage subscriptions


@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule // Essential for [(ngModel)] and NgForm
  ],
  templateUrl: './gestion.html', // Or the correct path to your HTML file
  styleUrls: ['./gestion.scss'] // Or .css
})
export class GestionComponent implements OnInit, OnDestroy{
  // --- Inject Services ---
  private markerService = inject(MarkerService);
  private cdr = inject(ChangeDetectorRef);

  // --- Component State ---
  markers: Marker[] = [];
  isLoading = false; // For initial data loading
  error: string | null = null; // For displaying loading errors
  selectedMarker: Marker | null = null; // Marker currently being viewed/edited
  isFormLoading = false; // For loading state during form actions (update/delete)

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    console.log("GestionComponent: ngOnInit called");
    this.loadMarkers();
  }


  ngOnDestroy(): void {
    console.log("GestionComponent: ngOnDestroy called");
  }

  // --- Data Loading ---
  private loadMarkers(): void {
    console.log("GestionComponent: loadMarkers called, setting isLoading = true");
    this.isLoading = true;
    this.error = null; // Clear previous errors
        this.cdr.detectChanges(); // Forcer la détection ici si nécessaire


    this.markerService.getMarkers().subscribe({
      next: (data) => {
        console.log("GestionComponent: Markers received", data);
        this.markers = data;
        this.isLoading = false;
            this.cdr.detectChanges(); // Forcer la détection 

        console.log("GestionComponent: Markers loaded successfully, isLoading = false");
      },
      error: (err) => {
        console.error('GestionComponent: Error loading markers', err);
        // Provide a user-friendly error message
        this.error = 'Erreur lors du chargement des marqueurs: ' + (err.message || 'Erreur inconnue');
        this.isLoading = false; 
            this.cdr.detectChanges(); 

        console.log("GestionComponent: Error occurred, isLoading = false");
      },
      complete: () => {
         console.log('GestionComponent: getMarkers Observable completed');
         if(this.isLoading) {
             console.warn("GestionComponent: Observable completed but isLoading was still true. Setting to false.");
             this.isLoading = false;
                 this.cdr.detectChanges(); // Forcer la détection ici si nécessaire

         }
      }
    });
  }

  // --- Marker Selection ---

  /**
   * Selects a marker to display its details in the form for viewing/editing.
   * @param marker The marker object to select.
   */

  selectMarker(marker: Marker): void {
    console.log("GestionComponent: Marker selected", marker);
    this.selectedMarker = { ...marker };
  }

  /**
   * Deselects the currently selected marker, clearing the form view.
   */
  deselectMarker(): void {
    console.log("GestionComponent: Marker deselected");
    this.selectedMarker = null;
  }

  // --- CRUD Operations ---
  /**
   * Handles form submission to update the selected marker.
   * @param form The NgForm instance from the template.
   */
  onSubmit(form: NgForm): void {
    console.log("GestionComponent: Form submitted", this.selectedMarker);
    if (this.selectedMarker && form.valid) {
        this.isFormLoading = true;
            this.cdr.detectChanges(); // Forcer la détection ici si nécessaire

        // Call the MarkerService to update the marker on the backend
        this.markerService.updateMarker(this.selectedMarker).subscribe({
            next: (updatedMarkerFromServer) => {
                console.log('GestionComponent: Marker updated successfully on server', updatedMarkerFromServer);
                // Update the local list with data returned by the server (important if server modifies data)
                const index = this.markers.findIndex(m => m.id === updatedMarkerFromServer.id);
                if (index !== -1) {
                    this.markers[index] = updatedMarkerFromServer;
                }
                // Update the selected marker in the form to reflect server data
                this.selectedMarker = { ...updatedMarkerFromServer };
                this.isFormLoading = false;
                    this.cdr.detectChanges(); // Forcer la détection ici si nécessaire

                // alert('Marqueur mis à jour avec succès !');
                this.deselectMarker()
                this.loadMarkers();
            },
            error: (err) => {
                console.error('GestionComponent: Error updating marker on server', err);
                this.isFormLoading = false;
                    this.cdr.detectChanges(); // Forcer la détection ici si nécessaire

                // Display a user-friendly error message
                alert('Erreur lors de la mise à jour du marqueur : ' + (err.message || 'Veuillez réessayer.'));
            }
        });
    } else {
        console.warn('GestionComponent: Form is invalid or no marker selected for update');
        if (!form.valid) {
            alert('Veuillez corriger les erreurs du formulaire.');
        } else {
            alert('Aucun marqueur sélectionné pour la mise à jour.');
        }
    }
}

  /**
   * Handles the deletion of the selected marker.
   */
  onDelete(): void {
    console.log("GestionComponent: Delete requested for", this.selectedMarker);
    if (this.selectedMarker && this.selectedMarker.id) {
      // Confirm deletion with the user
      if (confirm(`Voulez-vous vraiment supprimer le marqueur "${this.selectedMarker.name}" ?`)) {
        this.isFormLoading = true;
        this.cdr.detectChanges();
        // Call the MarkerService to delete the marker from the backend
        this.markerService.deleteMarker(this.selectedMarker.id).subscribe({
          next: () => {
            console.log('GestionComponent: Marker deleted successfully from server');
            // Remove the marker from the local list
            const index = this.markers.findIndex(m => m.id === this.selectedMarker!.id);
            if (index !== -1) {
              this.markers.splice(index, 1);
            }
            // Clear the form view as the marker is now deleted
            this.selectedMarker = null;
            this.isFormLoading = false;
            this.cdr.detectChanges();
            alert('Marqueur supprimé avec succès !');
            this.deselectMarker()
              this.loadMarkers();
          },
          error: (err) => {
            console.error('GestionComponent: Error deleting marker from server', err);
            this.isFormLoading = false;
            this.cdr.detectChanges();
            // Display a user-friendly error message
            alert('Erreur lors de la suppression du marqueur : ' + (err.message || 'Veuillez réessayer.'));
          }
        });
      }
    } else {
      alert('Impossible de supprimer ce marqueur (ID manquant).');
    }
  }




  // --- Utility Functions ---
  /**
   * Provides a Tailwind color class based on the marker's legal form.
   * @param form The legal form string.
   * @returns A Tailwind color prefix (e.g., 'blue', 'yellow').
   */
  getFormColor(form: string | undefined): string {
    switch (form?.toUpperCase()) {
      case 'COOPERATIVE': return 'blue';
      case 'ENTREPRISE': return 'yellow';
      case 'ASSOCIATION': return 'red';
      default: return 'gray';
    }
  }

  /**
   * TrackBy function for the markers list to improve performance of *ngFor.
   * @param index The index of the marker in the array.
   * @param marker The marker object.
   * @returns A unique identifier for the marker.
   */
  trackById(index: number, marker: Marker): string {
    return marker.id ?? `${marker.lat},${marker.lng}`;
  }
}
