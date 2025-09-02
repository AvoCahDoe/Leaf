import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Marker } from '../../core/models/marker.model';

const API_URL = 'http://localhost:5000/markers';

@Injectable({
  providedIn: 'root'
})

export class MarkerService {
  constructor(private http: HttpClient) {}

  getMarkers(): Observable<Marker[]> {
    return this.http.get<Marker[]>(API_URL).pipe(
      catchError(this.handleError)
      
    );
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  
}
