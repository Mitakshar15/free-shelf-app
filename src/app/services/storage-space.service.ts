import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  StorageSpace,
  ApiResponse,
  CreateStorageSpaceRequest,
  UpdateAvailabilityPeriodRequest,
  FindNearestStorageSpaceRequest,
  SpaceImage
} from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StorageSpaceService {
  private apiUrl = 'http://localhost:8080/v1/storagespace';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getStorageSpaces(): Observable<ApiResponse<StorageSpace[]>> {
    return this.http.get<ApiResponse<StorageSpace[]>>(
      this.apiUrl,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  createStorageSpace(request: CreateStorageSpaceRequest): Observable<ApiResponse<StorageSpace[]>> {
    return this.http.post<ApiResponse<StorageSpace[]>>(
      this.apiUrl,
      request,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  publishStorageSpace(spaceId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.apiUrl,
      {},
      {
        headers: this.authService.getAuthHeaders(),
        params: { spaceId: spaceId.toString() }
      }
    );
  }

  updateAvailabilityPeriod(spaceId: number, request: UpdateAvailabilityPeriodRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateAvailability`,
      request,
      {
        headers: this.authService.getAuthHeaders(),
        params: { spaceId: spaceId.toString() }
      }
    );
  }

  findNearestStorageSpace(request: FindNearestStorageSpaceRequest): Observable<ApiResponse<StorageSpace[]>> {
    return this.http.post<ApiResponse<StorageSpace[]>>(
      `${this.apiUrl}/find`,
      request,
      { headers: this.authService.getAuthHeaders() }
    );
  }


  getFeaturedSpaced(): Observable<ApiResponse<StorageSpace[]>> {
    return this.http.get<ApiResponse<StorageSpace[]>>(
      `${this.apiUrl}/featured`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  addStorageSpaceImages(storageSpaceId: number, images: File[], captions?: string[]): Observable<ApiResponse<SpaceImage[]>> {
    const formData = new FormData();

    images.forEach((image, index) => {
      formData.append('images', image);
    });

    let params: any = {};
    if (captions && captions.length > 0) {
      params.captions = captions;
    }

    return this.http.post<ApiResponse<SpaceImage[]>>(
      `${this.apiUrl}/addImages/${storageSpaceId}`,
      formData,
      {
        headers: this.authService.getAuthHeaders(),
        params
      }
    );
  }

  setImageAsPrimary(spaceId: number, imageId: number): Observable<ApiResponse<SpaceImage[]>> {
    return this.http.put<ApiResponse<SpaceImage[]>>(
      `${this.apiUrl}/${spaceId}/images/${imageId}`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }


}
