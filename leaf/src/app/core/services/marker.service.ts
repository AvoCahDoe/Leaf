// src/app/core/services/marker.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Marker } from '../../core/models/marker.model'; // Adjust path if needed

const API_URL = 'http://localhost:5000/markers';

@Injectable({
  providedIn: 'root', 
})

export class MarkerService {

  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

getMarkers(): Observable<Marker[]> {
    return this.http.get<Marker[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

addMarker(marker: Omit<Marker, 'id'>): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, marker).pipe(
      catchError(this.handleError)
    );
  }

deleteMarker(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


updateMarker(marker: Marker): Observable<Marker> {
  const url = `${this.apiUrl}/${marker.id}`;
  return this.http.put<Marker>(url, marker).pipe(
    catchError(this.handleError)
  );
}

















  // --- Error Handling ---
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nDetails: ${error.error}`;
      } else if (error.error && typeof error.error === 'object') {
        // Try to get a more specific message from the backend error object
        errorMessage += `\nDetails: ${JSON.stringify(error.error)}`;
      }
    }
    console.error(errorMessage); // Log the error for debugging
    // Return an observable with a user-facing error message.
    return throwError(() => new Error(errorMessage));
  }
}
