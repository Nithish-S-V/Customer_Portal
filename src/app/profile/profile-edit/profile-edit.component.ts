import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared/shared.module';
import { ProfileService } from '../profile';
import { Customer } from '../../shared/models/customer.model';

@Component({
  selector: 'app-profile-edit',
  imports: [SharedModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  customer: Customer | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      customerId: [{value: '', disabled: true}],
      addressNumber: [{value: '', disabled: true}],
      name: [{value: '', disabled: true}],
      email: ['', [Validators.required, Validators.email]],
      city: [{value: '', disabled: true}],
      country: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (customer) => {
        this.customer = customer;
        this.profileForm.patchValue(customer);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile. Please try again later.';
        this.isLoading = false;
        console.error('Failed to load profile', error);
      }
    });
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.profileForm.markAllAsTouched();
      return;
    }

    if (this.customer) {
      this.isSaving = true;
      
      const updatedProfile = {
        email: this.profileForm.get('email')?.value,
        phone: '' // Phone is not editable in current backend
      };

      this.profileService.updateProfile(updatedProfile).subscribe({
        next: (response) => {
          this.snackBar.open('Profile update request sent (feature not yet implemented)', 'Close', {
            duration: 3000,
            panelClass: ['info-snackbar']
          });
          this.isSaving = false;
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          const errorMsg = error.error?.error || 'Profile update is not yet implemented';
          this.snackBar.open(errorMsg, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSaving = false;
          console.error('Failed to update profile', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  getEmailErrorMessage(): string {
    const emailControl = this.profileForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

}