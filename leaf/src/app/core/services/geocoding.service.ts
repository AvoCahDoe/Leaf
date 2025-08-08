// src/app/core/services/geocoding.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly DEFAULT_HEADERS = new HttpHeaders({
    'Accept-Language': 'fr',
    'User-Agent': 'MyMapApp/1.0' // Nominatim requires a User-Agent
  });

  constructor(private http: HttpClient) { }

  // /**
  //  * Geocode an address to get its coordinates.
  //  * @param address The address string.
  //  * @param city The city string.
  //  * @returns An Observable emitting the coordinates or null if not found.
  //  */


  geocodeAddress(address: string, city: string): Observable<{ lat: number; lng: number } | null> {
    const fullAddress = `${address}, ${city}`;
    const url = `${this.NOMINATIM_BASE_URL}/search`;
    const params = {
      format: 'json',
      q: fullAddress
    };

    return this.http.get<any[]>(url, { headers: this.DEFAULT_HEADERS, params }).pipe(
      map(data => {
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Geocoding error:', error);
        return of(null); // Or throwError(error);
      })
    );
  }

  /**
   * Reverse geocode coordinates to get an address.
   * @param lat Latitude.
   * @param lng Longitude.
   * @returns An Observable emitting the address string or null if not found.
   */
  reverseGeocode(lat: number, lng: number): Observable<string | null> {
    const url = `${this.NOMINATIM_BASE_URL}/reverse`;
    const params = {
      format: 'json',
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: '1' // Include address details
    };

      return this.http.get<any>(url, { headers: this.DEFAULT_HEADERS, params }).pipe(
        map(data => {
          if (data && data.display_name) {
            return data.display_name;
          }
          return null;
        }),
      catchError((error) => {
        console.error('Reverse geocoding error:', error);
        // Return null or a default message on error, or re-throw
        return of(null); // Or throwError(error);
      })
    );
  }
}
