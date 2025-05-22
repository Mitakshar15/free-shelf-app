import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StorageSpaceService } from '../../../services/storage-space.service';
import { UserService } from '../../../services/user.service';
import { Address, CreateStorageSpaceRequest, StorageSpaceFeature } from '../../../models/models';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-host-basic-details',
  templateUrl: './host-basic-details.component.html',
  styleUrls: ['./host-basic-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class HostBasicDetailsComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();
  
  basicDetailsForm: FormGroup;
  addresses: Address[] = [];
  loading = false;
  error = '';
  success = '';
  
  spaceTypes = [
    { value: 'GARAGE', label: 'Garage' },
    { value: 'BASEMENT', label: 'Basement' },
    { value: 'ATTIC', label: 'Attic' },
    { value: 'STORAGE_UNIT', label: 'Storage Unit' },
    { value: 'ROOM', label: 'Room' },
    { value: 'SHED', label: 'Shed' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  features: { value: StorageSpaceFeature, label: string, checked: boolean }[] = [
    { value: 'CLIMATE_CONTROLLED', label: 'Climate Controlled', checked: false },
    { value: 'SECURITY_CAMERA', label: 'Security Camera', checked: false },
    { value: 'TWENTY_FOUR_HOUR_ACCESS', label: 'Twenty-Four Hour Access', checked: false },
    { value: 'DRIVE_UP_ACCESS', label: 'Drive-Up Access', checked: false },
    { value: 'INDOOR', label: 'Indoor', checked: false },
    { value: 'OUTDOOR', label: 'Outdoor', checked: false },
    { value: 'LOCKED', label: 'Locked', checked: false },
    { value: 'SHELVING', label: 'Shelving', checked: false },
    { value: 'ELECTRICITY', label: 'Electricity', checked: false },
    { value: 'LIGHTING', label: 'Lighting', checked: false },
    { value: 'ALARM_SYSTEM', label: 'Alarm System', checked: false }
  ];
  
  constructor(
    private fb: FormBuilder,
    private storageSpaceService: StorageSpaceService,
    private userService: UserService,
    private router: Router
  ) {
    this.basicDetailsForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      pricePerMonth: ['', [Validators.required, Validators.min(0)]],
      sizeInSquareFeet: ['', [Validators.required, Validators.min(0)]],
      spaceType: ['', Validators.required],
      addressId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserAddresses();
  }

  loadUserAddresses(): void {
    this.userService.getUserAddresses().subscribe({
      next: (response) => {
        if (response.data) {
          this.addresses = response.data;
        }
      },
      error: (err) => {
        this.error = 'Failed to load addresses. Please try again.';
        console.error('Error loading addresses:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.basicDetailsForm.invalid) {
      this.markFormGroupTouched(this.basicDetailsForm);
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const selectedFeatures = this.features
      .filter(feature => feature.checked)
      .map(feature => feature.value);
      
    // Format dates as OffsetDateTime
    const formValues = this.basicDetailsForm.value;
    const startDate = new Date(formValues.startDate);
    const endDate = new Date(formValues.endDate);
    
    // Create the request with the correct structure
    const request: CreateStorageSpaceRequest = {
      title: formValues.title,
      description: formValues.description,
      pricePerMonth: formValues.pricePerMonth,
      sizeInSquareFeet: formValues.sizeInSquareFeet,
      spaceType: formValues.spaceType,
      addressId: formValues.addressId,
      features: selectedFeatures,
      availabilityPeriod: {
        startDate: this.formatAsOffsetDateTime(startDate),
        endDate: this.formatAsOffsetDateTime(endDate)
      }
    };

    this.storageSpaceService.createStorageSpace(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data && response.data.length > 0) {
          this.success = 'Storage space created successfully!';
          
          // Store the created space ID in localStorage for the next steps
          localStorage.setItem('currentStorageSpaceId', response.data[0].id?.toString() || '');
          
          // Move to the next step
          setTimeout(() => {
            this.nextStep.emit();
          }, 1000);
        } else {
          this.error = 'Failed to create storage space. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.status?.statusMessage || 'Failed to create storage space. Please try again.';
        console.error('Error creating storage space:', err);
      }
    });
  }

  toggleFeature(feature: { value: StorageSpaceFeature, label: string, checked: boolean }): void {
    feature.checked = !feature.checked;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get minEndDate(): string {
    const startDate = this.basicDetailsForm.get('startDate')?.value;
    return startDate || new Date().toISOString().split('T')[0];
  }

  get minStartDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  /**
   * Format a date as OffsetDateTime format
   * @param date The date to format
   * @returns The date in OffsetDateTime format (ISO 8601 with timezone offset)
   */
  private formatAsOffsetDateTime(date: Date): string {
    return date.toISOString(); // ISO 8601 format with timezone offset
  }
}
