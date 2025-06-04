import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  Address,
  ApiResponse,
  UpdateProfileRequest,
  AddNewAddressRequest,
  EditAddressRequest
} from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://freeshelf-10t4.onrender.com/v1/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService,

  ) { }

  getUserProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      this.apiUrl,
      { headers: this.authService.getAuthHeaders() }
    );
  }


  updateUserProfile(updateProfileRequest: UpdateProfileRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.apiUrl,
      updateProfileRequest,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  getUserAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(
      `${this.apiUrl}/address`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  addAddress(addressRequest: AddNewAddressRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/address`,
      addressRequest,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  editAddress(addressRequest: EditAddressRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/address`,
      addressRequest,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteAddress(addressId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/address`,
      {
        headers: this.authService.getAuthHeaders(),
        params: { addressId: addressId.toString() }
      }
    );
  }
}
