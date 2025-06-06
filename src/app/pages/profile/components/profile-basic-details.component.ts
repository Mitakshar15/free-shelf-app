import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User, UpdateProfileRequest } from '../../../models/models';

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

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.user && this.profileForm) {
      this.updateFormValues();
    }
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
