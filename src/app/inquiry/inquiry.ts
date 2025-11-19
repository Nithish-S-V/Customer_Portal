import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SalesOrder } from '../shared/models/sales-order.model';
import { ApiService } from '../shared/services/api.service';

export interface Inquiry {
  inquiryNumber: string;
  productCode: string;
  productDescription: string;
  amount: number;
  currency: string;
  unit: string;
  validFrom: string;
  validTo: string;
  createdDate: string;
  createdBy: string;
  documentType: string;
  itemNumber: string;
}

export interface InquiryRequest {
  productCode: string;
  quantity: number;
  deliveryDate: string;
  description: string;
}

export interface InquiryResponse {
  success: boolean;
  inquiryNumber: string;
  message: string;
}

export interface InquiriesApiResponse {
  success: boolean;
  inquiries: any[];
  count: number;
  message: string;
}

export interface SalesOrdersApiResponse {
  success: boolean;
  salesOrders: any[];
  count: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class InquiryService {

  constructor(private apiService: ApiService) { }

  createInquiry(inquiryData: InquiryRequest): Observable<InquiryResponse> {
    // TODO: Implement inquiry creation when backend endpoint is available
    return this.apiService.post<InquiryResponse>('/inquiries', inquiryData);
  }

  getInquiries(): Observable<any[]> {
    return this.apiService.get<InquiriesApiResponse>('/inquiries').pipe(
      map(response => response.inquiries || [])
    );
  }

  getSalesOrderList(): Observable<any[]> {
    return this.apiService.get<SalesOrdersApiResponse>('/sales-orders').pipe(
      map(response => response.salesOrders || [])
    );
  }

  getSalesOrderDetails(orderId: string): Observable<any> {
    return this.apiService.get<any>(`/sales-orders/${orderId}`).pipe(
      map(response => response.salesOrder || response)
    );
  }
}
