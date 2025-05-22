import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { AddNewAddressRequest } from '../../../models/models';

@Component({
  selector: 'app-add-address-modal',
  templateUrl: './add-address-modal.component.html',
  styleUrls: ['./add-address-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class AddAddressModalComponent {
  @Output() addressAdded = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  
  addressForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.addressForm = this.fb.group({
      addressLine1: ['', [Validators.required, Validators.maxLength(100)]],
      addressLine2: ['', Validators.maxLength(100)],
      street: ['', Validators.maxLength(100)],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      zipCode: ['', [Validators.required, Validators.maxLength(10)]],
      country: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }
  
  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.success = '';
    
    const addressRequest: AddNewAddressRequest = this.addressForm.value;
    
    this.userService.addAddress(addressRequest).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.status?.statusCode === 201 || response.status?.statusCode === 200) {
          this.success = 'Address added successfully!';
          
          // Emit event to notify parent component
          setTimeout(() => {
            this.addressAdded.emit();
            this.close();
          }, 1000);
        } else {
          this.error = response.status?.statusMessage || 'Failed to add address. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.status?.statusMessage || 'Failed to add address. Please try again.';
        console.error('Error adding address:', err);
      }
    });
  }
  
  close(): void {
    this.closeModal.emit();
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
