import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../shared/services/api.service';

export interface DashboardSummary {
  totalInquiries: number;
  totalSalesOrders: number;
  totalDeliveries: number;
  totalInvoices: number;
  totalOverallSales: number;
}

export interface DashboardApiResponse {
  success: boolean;
  summary: DashboardSummary;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.apiService.get<DashboardApiResponse>('/dashboard/summary').pipe(
      map(response => response.summary)
    );
  }
}
