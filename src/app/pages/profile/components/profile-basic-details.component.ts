import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User, UpdateProfileRequest } from '../../../models/models';
import {AuthService} from '../../../services/auth.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {finalize, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'app-profile-basic-details',
  templateUrl: './profile-basic-details.component.html',
  styleUrls: ['./profile-basic-details.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileBasicDetailsComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() profileUpdated = new EventEmitter<User>();

  profileForm!: FormGroup;
  isEditing = false;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  proflePicFlag: boolean = false;
  selectedImage: string | null = null;
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadError = '';
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient,
  ) {}
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please select a valid image file.';
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'File size must be less than 5MB.';
      return;
    }

    this.uploadError = '';
    this.selectedFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    this.uploadError = '';
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadError = '';

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put(this.authService.baseUrl+'/user/profilepic', formData, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Upload failed:', error);

          if (error.status === 401) {
            this.uploadError = 'Authentication failed. Please login again.';
          } else if (error.status === 413) {
            this.uploadError = 'File too large. Please select a smaller image.';
          } else if (error.status === 415) {
            this.uploadError = 'Unsupported file type. Please select a valid image.';
          } else if (error.status === 0) {
            this.uploadError = 'Network error. Please check your connection.';
          } else {
            this.uploadError = error.error?.message || 'Upload failed. Please try again.';
          }

          return throwError(error);
        }),
        finalize(() => {
          this.isUploading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Profile picture updated successfully:', response);
          this.proflePicFlag = false;
          this.resetModal();
          // Optional: Show success message
        },
        error: (error) => {
          // Error already handled in catchError
        }
      });
  }

  closeModal(): void {
    this.proflePicFlag = false;
    this.resetModal();
  }

  private resetModal(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    this.uploadError = '';
    this.isDragOver = false;
    this.isUploading = false;
  }
  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.user && this.profileForm) {
      this.updateFormValues();
    }
  }

  openEditProfile(): void {
    this.proflePicFlag = !this.proflePicFlag;
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      bio: ['']
    });

    if (this.user) {
      this.updateFormValues();
    }
  }

  private updateFormValues(): void {
    this.profileForm.patchValue({
      firstName: this.user?.firstName || '',
      lastName: this.user?.lastName || '',
      bio: this.user?.profile?.bio || ''
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.updateFormValues();
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    const updateRequest: UpdateProfileRequest = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      bio: this.profileForm.value.bio,
    };

    this.userService.updateUserProfile(updateRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.data) {
          // Reload user profile to get updated data
          this.userService.getUserProfile().subscribe({
            next: (profileResponse) => {
              if (profileResponse.data) {
                this.user = profileResponse.data;
                this.profileUpdated.emit(this.user);
                this.successMessage = 'Profile updated successfully!';
                this.isEditing = false;
              }
            }
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating profile', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
      }
    });
  }
}
