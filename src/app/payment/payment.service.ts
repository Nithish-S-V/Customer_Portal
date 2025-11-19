import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentRequest } from '../shared/models/payment.model';
import { ApiService } from '../shared/services/api.service';

export interface PaymentsApiResponse {
  success: boolean;
  payments: any[];
  count: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(private apiService: ApiService) { }

  getPaymentList(): Observable<any[]> {
    // TODO: Implement when backend payment endpoint is available
    // For now, return empty array
    return this.apiService.get<PaymentsApiResponse>('/payments').pipe(
      map(response => response.payments || [])
    );
  }

  getUnpaidInvoices(): Observable<any[]> {
    // Get unpaid invoices from invoice endpoint
    return this.apiService.get<any>('/invoices?status=open').pipe(
      map(response => response.invoices || [])
    );
  }

  processPayment(paymentRequest: PaymentRequest): Observable<{ success: boolean; paymentNumber: string; message: string }> {
    // TODO: Implement when backend payment processing endpoint is available
    return this.apiService.post<{ success: boolean; paymentNumber: string; message: string }>('/payments', paymentRequest);
  }
}
