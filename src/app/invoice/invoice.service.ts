import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../shared/services/api.service';
import { Invoice } from '../shared/models/invoice.model';

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface InvoicesApiResponse {
  success: boolean;
  invoices: any[];
  count: number;
  message: string;
}

export interface CreditDebitMemosApiResponse {
  success: boolean;
  memos: any[];
  count: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  // BehaviorSubject to hold the complete list of all invoice items
  private invoiceListSource = new BehaviorSubject<Invoice[]>([]);
  
  // Public Observable that components can subscribe to
  public invoiceList$ = this.invoiceListSource.asObservable();

  constructor(private apiService: ApiService) { }

  getInvoiceStats(): Observable<InvoiceStats> {
    // TODO: Create dedicated stats endpoint or calculate from invoice list
    return this.apiService.get<InvoicesApiResponse>('/invoices').pipe(
      map(response => {
        const invoices = response.invoices || [];
        return {
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.amount) || 0), 0),
          paidAmount: 0, // TODO: Calculate from invoice status
          pendingAmount: 0 // TODO: Calculate from invoice status
        };
      })
    );
  }

  getRecentInvoices(count: number): Observable<any[]> {
    return this.apiService.get<InvoicesApiResponse>('/invoices').pipe(
      map(response => (response.invoices || []).slice(0, count))
    );
  }

  getInvoiceList(skip: number = 0, top: number = 10): Observable<{ invoices: Invoice[], totalCount: number }> {
    return this.apiService.get<InvoicesApiResponse>('/invoices').pipe(
      tap(response => {
        // Store the complete list in the BehaviorSubject for detail component access
        const allInvoices = response.invoices || [];
        this.invoiceListSource.next(allInvoices);
      }),
      map(response => {
        const allInvoices = response.invoices || [];
        return {
          invoices: allInvoices.slice(skip, skip + top),
          totalCount: allInvoices.length
        };
      })
    );
  }

  getInvoiceDetails(invoiceId: string): Observable<any> {
    return this.apiService.get<any>(`/invoices/${invoiceId}`).pipe(
      map(response => response.invoice || response)
    );
  }

  // DEPRECATED: Use getMemos() instead - this method calls non-existent endpoint
  // Kept for backward compatibility but should not be used
  getCreditDebitNotes(docType?: string): Observable<any[]> {
    // CORRECTED: Call the correct endpoint
    return this.getMemos().pipe(
      map(memos => {
        // Filter by document type if specified
        if (docType) {
          const typeCode = docType === 'CREDIT' ? 'G2' : 'L2';
          return memos.filter(memo => memo.documentType === typeCode);
        }
        return memos;
      })
    );
  }

  getCreditDebitNoteDetails(noteId: string, docType: string): Observable<any> {
    // CORRECTED: Get from memos list
    return this.getMemos().pipe(
      map(memos => {
        const memo = memos.find(m => m.documentNumber === noteId);
        return memo || null;
      })
    );
  }

  // New methods for Finance Sheet tabs
  getMemos(): Observable<any[]> {
    return this.apiService.get<any>('/memos').pipe(
      map(response => response.memos || [])
    );
  }

  getAgingSummary(): Observable<any> {
    return this.apiService.get<any>('/aging/summary').pipe(
      map(response => {
        const summary = response.agingSummary || {};
        // Transform to match component expectations
        return {
          days0to30: summary.days_0_30 || 0,
          days31to60: summary.days_31_60 || 0,
          days61to90: summary.days_61_90 || 0,
          days91Plus: summary.days_91_plus || 0,
          totalOutstanding: summary.total_due || 0,
          currency: summary.currency || 'USD'
        };
      })
    );
  }

  getAgingDetail(): Observable<any[]> {
    return this.apiService.get<any>('/aging/detail').pipe(
      map(response => response.agingDetail || [])
    );
  }

  getOverallSales(): Observable<any[]> {
    return this.apiService.get<any>('/sales/overall').pipe(
      map(response => response.overallSales || [])
    );
  }

  /**
   * Download invoice PDF
   * @param invoiceId - Invoice document number
   */
  downloadInvoicePdf(invoiceId: string): Observable<Blob> {
    return this.apiService.getBlob(`/invoice/${invoiceId}/pdf`);
  }
}
