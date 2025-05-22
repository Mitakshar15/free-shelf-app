import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { Address, AddNewAddressRequest, EditAddressRequest } from '../../../models/models';

@Component({
  selector: 'app-profile-addresses',
  templateUrl: './profile-addresses.component.html',
  styleUrls: ['./profile-addresses.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileAddressesComponent implements OnInit {
  @Input() addresses: Address[] = [];
  @Output() addressesUpdated = new EventEmitter<void>();

  addressForm!: FormGroup;
  isAddingAddress = false;
  isEditingAddress = false;
  currentEditAddressId: number | null = null;
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

  private initForm(): void {
    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      street: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  startAddAddress(): void {
    this.isAddingAddress = true;
    this.isEditingAddress = false;
    this.currentEditAddressId = null;
    this.addressForm.reset();
    this.clearMessages();
  }

  cancelAddAddress(): void {
    this.isAddingAddress = false;
    this.addressForm.reset();
    this.clearMessages();
  }

  startEditAddress(address: Address): void {
    this.isEditingAddress = true;
    this.isAddingAddress = false;
    this.currentEditAddressId = address.id || null;
    this.clearMessages();
    
    this.addressForm.patchValue({
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || ''
    });
  }

  cancelEditAddress(): void {
    this.isEditingAddress = false;
    this.currentEditAddressId = null;
    this.addressForm.reset();
    this.clearMessages();
  }

  onSubmitAddress(): void {
    if (this.addressForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    if (this.isAddingAddress) {
      this.addNewAddress();
    } else if (this.isEditingAddress && this.currentEditAddressId) {
      this.editAddress();
    }
  }

  private addNewAddress(): void {
    const addressRequest: AddNewAddressRequest = {
      addressLine1: this.addressForm.value.addressLine1,
      addressLine2: this.addressForm.value.addressLine2,
      street: this.addressForm.value.street,
      city: this.addressForm.value.city,
      state: this.addressForm.value.state,
      zipCode: this.addressForm.value.zipCode,
      country: this.addressForm.value.country
    };

    this.userService.addAddress(addressRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Address added successfully!';
        this.addressForm.reset();
        this.isAddingAddress = false;
        this.addressesUpdated.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding address', error);
        this.errorMessage = 'Failed to add address. Please try again.';
      }
    });
  }

  private editAddress(): void {
    if (!this.currentEditAddressId) return;

    const addressRequest: EditAddressRequest = {
      id: this.currentEditAddressId,
      addressLine1: this.addressForm.value.addressLine1,
      addressLine2: this.addressForm.value.addressLine2,
      street: this.addressForm.value.street,
      city: this.addressForm.value.city,
      state: this.addressForm.value.state,
      zipCode: this.addressForm.value.zipCode,
      country: this.addressForm.value.country
    };

    this.userService.editAddress(addressRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Address updated successfully!';
        this.addressForm.reset();
        this.isEditingAddress = false;
        this.currentEditAddressId = null;
        this.addressesUpdated.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating address', error);
        this.errorMessage = 'Failed to update address. Please try again.';
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.clearMessages();
      
      this.userService.deleteAddress(addressId).subscribe({
        next: (response) => {
          this.successMessage = 'Address deleted successfully!';
          this.addressesUpdated.emit();
        },
        error: (error) => {
          console.error('Error deleting address', error);
          this.errorMessage = 'Failed to delete address. Please try again.';
        }
      });
    }
  }

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}
