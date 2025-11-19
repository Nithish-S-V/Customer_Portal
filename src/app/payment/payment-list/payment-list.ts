import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../payment.service';
import { Payment } from '../../shared/models/payment.model';

@Component({
  selector: 'app-payment-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css',
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showRetry: boolean = false;
  displayedColumns: string[] = ['paymentNumber', 'invoiceReference', 'amount', 'paymentDate', 'paymentMethod', 'status'];

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showRetry = false;
    
    this.paymentService.getPaymentList()
      .subscribe({
        next: (payments) => {
          this.payments = payments;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load payments', error);
          this.errorMessage = 'Failed to load payments. Please try again later.';
          this.showRetry = true;
          this.isLoading = false;
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Pending':
        return 'status-pending';
      case 'Failed':
        return 'status-failed';
      default:
        return '';
    }
  }

  onRetry(): void {
    this.loadPayments();
  }
}
