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
import {ApiService} from './api.service';
import {API_CONFIG} from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class StorageSpaceService {
  constructor(
    private authService: AuthService,
    private api: ApiService
  ) { }

  getStorageSpaces(): Observable<ApiResponse<StorageSpace[]>> {
    return this.api.get<ApiResponse<StorageSpace[]>>(
     API_CONFIG.ENDPOINTS.STORAGE_SPACE.GET_MY_SPACES,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  createStorageSpace(request: CreateStorageSpaceRequest): Observable<ApiResponse<StorageSpace[]>> {
    return this.api.post<ApiResponse<StorageSpace[]>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.ADD_SPACE,
      request,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  publishStorageSpace(spaceId: number): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.PUBLISH_STORAGE_SPACE,
      {},
      {
        headers: this.authService.getAuthHeaders(),
        params: { spaceId: spaceId.toString() }
      }
    );
  }

  updateAvailabilityPeriod(spaceId: number, request: UpdateAvailabilityPeriodRequest): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.UPDATE_SPACE_AVAILABILITY,
      request,
      {
        headers: this.authService.getAuthHeaders(),
        params: { spaceId: spaceId.toString() }
      }
    );
  }

  findNearestStorageSpace(request: FindNearestStorageSpaceRequest): Observable<ApiResponse<StorageSpace[]>> {
    return this.api.post<ApiResponse<StorageSpace[]>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.FIND_NEAREST_SPACE,
      request,
      { headers: this.authService.getAuthHeaders() }
    );
  }


  getFeaturedSpaced(): Observable<ApiResponse<StorageSpace[]>> {
    return this.api.get<ApiResponse<StorageSpace[]>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.GET_FEATURED_SPACES,
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
    return this.api.post<ApiResponse<SpaceImage[]>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.ADD_SPACE_IMAGES(storageSpaceId),
      formData,
      {
        headers: this.authService.getAuthHeaders(),
        params
      }
    );
  }

  setImageAsPrimary(spaceId: number, imageId: number): Observable<ApiResponse<SpaceImage[]>> {
    return this.api.put<ApiResponse<SpaceImage[]>>(
      API_CONFIG.ENDPOINTS.STORAGE_SPACE.SET_PRIMARY_IMAGE(spaceId, imageId),
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }


}
