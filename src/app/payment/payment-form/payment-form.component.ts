import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared/shared.module';
import { PaymentService } from '../payment.service';
import { InvoiceService } from '../../invoice/invoice.service';
import { Invoice } from '../../shared/models/invoice.model';
import { PaymentRequest } from '../../shared/models/payment.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  unpaidInvoices: Invoice[] = [];
  isLoading = false;
  selectedInvoice: Invoice | null = null;

  paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHECK', label: 'Check' },
    { value: 'CASH', label: 'Cash' }
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.fb.group({
      invoiceId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      method: ['CREDIT_CARD', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUnpaidInvoices();
    this.setupFormValidation();
  }

  loadUnpaidInvoices(): void {
    this.isLoading = true;
    this.paymentService.getUnpaidInvoices().subscribe({
      next: (invoices) => {
        this.unpaidInvoices = invoices;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load unpaid invoices', error);
        this.isLoading = false;
      }
    });
  }

  setupFormValidation(): void {
    // Watch for invoice selection changes
    this.paymentForm.get('invoiceId')?.valueChanges.subscribe(invoiceId => {
      this.selectedInvoice = this.unpaidInvoices.find(inv => inv.documentNumber === invoiceId) || null;
      
      // Update amount validation based on selected invoice
      if (this.selectedInvoice) {
        const amountControl = this.paymentForm.get('amount');
        amountControl?.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(this.selectedInvoice.netValue)
        ]);
        amountControl?.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (this.selectedInvoice) {
      const formValue = this.paymentForm.value;
      
      // Additional validation
      if (formValue.amount > this.selectedInvoice.netValue) {
        this.snackBar.open('Payment amount exceeds invoice balance', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.isLoading = true;
      
      const paymentRequest: PaymentRequest = {
        invoiceId: formValue.invoiceId,
        amount: formValue.amount,
        method: formValue.method
      };

      this.paymentService.processPayment(paymentRequest).subscribe({
        next: (response) => {
          this.snackBar.open('Payment processed successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Payment failed. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } else {
      this.snackBar.open('Please select an invoice', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  resetForm(): void {
    this.paymentForm.reset({
      invoiceId: '',
      amount: 0,
      method: 'CREDIT_CARD'
    });
    this.selectedInvoice = null;
  }

  // Getter methods for template
  get invoiceIdControl() { return this.paymentForm.get('invoiceId'); }
  get amountControl() { return this.paymentForm.get('amount'); }
  get methodControl() { return this.paymentForm.get('method'); }
}