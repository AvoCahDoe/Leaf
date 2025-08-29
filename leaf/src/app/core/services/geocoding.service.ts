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


  geocodeAddress(address: string, city: string): Observable<{ lat: number; lng: number } | null> {
    const fullAddress = `${address}, ${city}`;
    const url = `${this.NOMINATIM_BASE_URL}/search`;      // bach y3tina formt b7l hka https://nominatim.openstreetmap.org/search?format=json&q=<address>
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
