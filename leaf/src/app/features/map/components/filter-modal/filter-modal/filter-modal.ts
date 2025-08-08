// src/app/features/map/components/filter-modal/filter-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-modal.html',
  styleUrls: ['./filter-modal.scss']
})
export class FilterModalComponent {

  // --- Inputs ---
  /** Current filter value for marker name. */
  @Input() filterName: string = '';

  /** Current filter value for marker form. */
  @Input() filterForm: string = '';

  /** Current filter value for marker ICE. */
  @Input() filterIce: string = '';

  /** Total number of markers (before filtering). */
  @Input() totalMarkers: number = 0;

  /** Number of markers currently displayed after filtering. */
  @Input() filteredMarkersCount: number = 0;

  // --- Outputs ---
  /** Emitted when filter values change. Payload contains the new filter values. */
  @Output() filtersChange = new EventEmitter<{ name: string; form: string; ice: string }>();

  /** Emitted when the user wants to clear all filters. */
  @Output() clearFilters = new EventEmitter<void>();

  /** Emitted when the modal should be closed. */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Handles input changes for filter fields.
   * Emits the `filtersChange` event with current filter values.
   */
  onFiltersChange(): void {
    this.filtersChange.emit({
      name: this.filterName,
      form: this.filterForm,
      ice: this.filterIce
    });
  }

  /**
   * Handles changes to the 'Forme Juridique' select dropdown.
   * Emits the `filtersChange` event.
   */
  onFormChange(): void {
    this.onFiltersChange(); // Reuse the common handler
  }

  /**
   * Emits the `clearFilters` event to signal the parent to reset filters.
   */
  onClearFilters(): void {
    this.clearFilters.emit();
  }

  /**
   * Emits the `closeModal` event to signal the parent to close this modal.
   */
  onClose(): void {
    this.closeModal.emit();
  }
}
