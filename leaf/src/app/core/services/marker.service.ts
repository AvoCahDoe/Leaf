import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { createMoroccanCityMarkers } from '../data/moroccan-cities.seed';
import { Marker } from '../models/marker.model';

const STORAGE_KEY = 'leaf_markers';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private readonly markersSubject: BehaviorSubject<Marker[]>;
  readonly markers$: Observable<Marker[]>;

  constructor() {
    const { markers, seeded } = this.loadInitialMarkers();
    this.markersSubject = new BehaviorSubject(markers);
    this.markers$ = this.markersSubject.asObservable();
    if (seeded) {
      this.writeToStorage(markers);
    }
  }

  getMarkers(): Observable<Marker[]> {
    return of([...this.markersSubject.getValue()]);
  }

  addMarker(marker: Omit<Marker, 'id'>): Observable<{ id: string }> {
    const id = crypto.randomUUID();
    const created: Marker = { ...marker, id };
    this.persist([...this.markersSubject.getValue(), created]);
    return of({ id });
  }

  updateMarker(marker: Marker): Observable<Marker> {
    if (!marker.id) {
      return throwError(() => new Error('Marker ID is required for update'));
    }

    const markers = this.markersSubject.getValue();
    const index = markers.findIndex((m) => m.id === marker.id);
    if (index === -1) {
      return throwError(() => new Error(`Marker not found: ${marker.id}`));
    }

    const updated = [...markers];
    updated[index] = { ...marker };
    this.persist(updated);
    return of(updated[index]);
  }

  deleteMarker(id: string): Observable<void> {
    const current = this.markersSubject.getValue();
    const markers = current.filter((m) => m.id !== id);
    if (markers.length === current.length) {
      return throwError(() => new Error(`Marker not found: ${id}`));
    }
    this.persist(markers);
    return of(undefined);
  }

  importMarkers(markers: Marker[], replace = false): Observable<Marker[]> {
    const normalized = markers
      .filter((m) => m?.name?.trim())
      .map((m) => ({
        ...m,
        id: m.id || crypto.randomUUID(),
        name: m.name.trim(),
      }));

    const merged = replace ? normalized : [...this.markersSubject.getValue(), ...normalized];
    this.persist(merged);
    return of(merged);
  }

  parseMarkersFileContent(content: string): Marker[] {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/const\s+\w+\s*:\s*\w+\[\]\s*=\s*(\[[\s\S]*\]);?/);
      if (!match) {
        throw new Error('Format de fichier non reconnu. Utilisez un tableau JSON.');
      }
      parsed = JSON.parse(match[1]);
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Le fichier doit contenir un tableau de marqueurs.');
    }

    return parsed.map((item, index) => this.normalizeImportedMarker(item, index));
  }

  exportMarkersToFile(): void {
    const data = this.markersSubject.getValue();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `markers_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private normalizeImportedMarker(item: unknown, index: number): Marker {
    if (!item || typeof item !== 'object') {
      throw new Error(`Marqueur invalide à l'index ${index}`);
    }

    const record = item as Record<string, unknown>;
    const name = typeof record['name'] === 'string' ? record['name'].trim() : '';
    if (!name) {
      throw new Error(`Marqueur invalide à l'index ${index}: nom manquant`);
    }

    const lat = this.toNumber(record['lat']);
    const lng = this.toNumber(record['lng']);

    return {
      id: typeof record['id'] === 'string' ? record['id'] : crypto.randomUUID(),
      name,
      lat: lat ?? 31.7917,
      lng: lng ?? -7.0926,
      activity: this.toString(record['activity']),
      address: this.toString(record['address']),
      city: this.toString(record['city']),
      phone: this.toString(record['phone']),
      fax: this.toString(record['fax']),
      email: this.toString(record['email']),
      rc: this.toString(record['rc']),
      ice: this.toString(record['ice']),
      form: this.toString(record['form'])?.toUpperCase(),
      addr_housenumber: this.toString(record['addr_housenumber']),
      addr_street: this.toString(record['addr_street']),
      addr_postcode: this.toString(record['addr_postcode']),
      addr_province: this.toString(record['addr_province']),
      addr_place: this.toString(record['addr_place']),
      nombreEmployes: this.toNumber(record['nombreEmployes']),
      chiffreAffaires: this.toNumber(record['chiffreAffaires']),
      dateCreation: this.toString(record['dateCreation']),
      identifiantBourse: this.toString(record['identifiantBourse']),
      nombreClientsActifs: this.toNumber(record['nombreClientsActifs']),
    };
  }

  private toString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private toNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private loadInitialMarkers(): { markers: Marker[]; seeded: boolean } {
    if (typeof localStorage === 'undefined') {
      return { markers: createMoroccanCityMarkers(), seeded: false };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { markers: createMoroccanCityMarkers(), seeded: true };
      }

      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return { markers: createMoroccanCityMarkers(), seeded: true };
      }

      return { markers: data, seeded: false };
    } catch (error) {
      console.error('Failed to read markers from localStorage:', error);
      return { markers: createMoroccanCityMarkers(), seeded: true };
    }
  }

  private writeToStorage(markers: Marker[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
    }
  }

  private persist(markers: Marker[]): void {
    this.writeToStorage(markers);
    this.markersSubject.next(markers);
  }
}
