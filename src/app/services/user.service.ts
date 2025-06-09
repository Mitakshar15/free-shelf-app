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
import {ApiService} from './api.service';
import {API_CONFIG} from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private authService: AuthService,
    private api: ApiService

  ) { }

  getUserProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(
      API_CONFIG.ENDPOINTS.USER.PROFILE,
      { headers: this.authService.getAuthHeaders() }
    );
  }


  updateUserProfile(updateProfileRequest: UpdateProfileRequest): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.USER.EDIT_PROFILE,
      updateProfileRequest,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  getUserAddresses(): Observable<ApiResponse<Address[]>> {
    return this.api.get<ApiResponse<Address[]>>(
      API_CONFIG.ENDPOINTS.USER.ADDRESS.LIST,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  addAddress(addressRequest: AddNewAddressRequest): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.USER.ADDRESS.ADD,
      addressRequest,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  editAddress(addressRequest: EditAddressRequest): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.USER.ADDRESS.EDIT,
      addressRequest,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteAddress(addressId: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.USER.ADDRESS.DELETE,
      {
        headers: this.authService.getAuthHeaders(),
        params: { addressId: addressId }
      }
    );
  }
}
