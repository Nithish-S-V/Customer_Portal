import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared/shared.module';
import { InquiryService, InquiryRequest } from '../inquiry';

@Component({
  selector: 'app-inquiry-form',
  imports: [SharedModule],
  templateUrl: './inquiry-form.html',
  styleUrl: './inquiry-form.css',
})
export class InquiryFormComponent implements OnInit {
  inquiryForm!: FormGroup;
  isLoading = false;
  maxDescriptionLength = 500;

  constructor(
    private fb: FormBuilder,
    private inquiryService: InquiryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.inquiryForm = this.fb.group({
      productCode: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      deliveryDate: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(this.maxDescriptionLength)]]
    });
  }

  get descriptionCharacterCount(): number {
    const description = this.inquiryForm.get('description')?.value || '';
    return description.length;
  }

  onSubmit(): void {
    if (this.inquiryForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.inquiryForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    const inquiryData: InquiryRequest = {
      productCode: this.inquiryForm.value.productCode,
      quantity: this.inquiryForm.value.quantity,
      deliveryDate: this.inquiryForm.value.deliveryDate,
      description: this.inquiryForm.value.description
    };

    this.inquiryService.createInquiry(inquiryData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open(
          `Inquiry submitted successfully! Inquiry Number: ${response.inquiryNumber}`,
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to submit inquiry. Please try again.',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private resetForm(): void {
    this.inquiryForm.reset();
    this.initializeForm();
  }
}
