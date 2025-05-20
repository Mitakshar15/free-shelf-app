import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Booking, 
  ApiResponse, 
  BookingRequest 
} from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/v1/storagespace/booking';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  bookStorageSpace(request: BookingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.apiUrl,
      request,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  payForStorageSpace(request: BookingRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.apiUrl,
      request,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  getStorageSpaceBookings(spaceId: number): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(
      `${this.apiUrl}/${spaceId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  acceptStorageSpaceBooking(bookingId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/accept`,
      {},
      { 
        headers: this.authService.getAuthHeaders(),
        params: { bookingId: bookingId.toString() }
      }
    );
  }

  rejectStorageSpaceBooking(bookingId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/reject`,
      {},
      { 
        headers: this.authService.getAuthHeaders(),
        params: { bookingId: bookingId.toString() }
      }
    );
  }
}
