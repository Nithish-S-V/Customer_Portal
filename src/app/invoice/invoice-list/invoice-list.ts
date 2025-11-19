import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { InvoiceService } from '../invoice.service';
import { Invoice } from '../../shared/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './invoice-list.html',
  styleUrls: ['./invoice-list.css']
})
export class InvoiceList implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  totalCount: number = 0;
  pageSize: number = 50;
  currentPage: number = 0;
  searchText: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showRetry: boolean = false;
  displayedColumns: string[] = ['documentNumber', 'itemNumber', 'billingDate', 'netValue', 'actions'];
  Math = Math;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showRetry = false;
    const skip = this.currentPage * this.pageSize;
    
    this.invoiceService.getInvoiceList(skip, this.pageSize)
      .subscribe({
        next: (response) => {
          this.invoices = response.invoices;
          this.filteredInvoices = [...this.invoices];
          this.totalCount = response.totalCount;
          this.isLoading = false;
          this.applySearch();
          // Fix: Trigger change detection to update UI
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load invoices', error);
          this.errorMessage = 'Failed to load invoices. Please try again later.';
          this.showRetry = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onNextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.loadInvoices();
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadInvoices();
    }
  }

  onSearch(): void {
    this.applySearch();
  }

  applySearch(): void {
    if (this.searchText.trim() === '') {
      this.filteredInvoices = [...this.invoices];
    } else {
      this.filteredInvoices = this.invoices.filter(invoice =>
        invoice.documentNumber.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  onViewForm(invoiceId: string): void {
    console.log('Downloading PDF for invoice:', invoiceId);
    
    this.invoiceService.downloadInvoicePdf(invoiceId).subscribe({
      next: (blob) => {
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Open PDF in new tab
        window.open(url, '_blank');
        
        // Clean up the URL after a short delay
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      },
      error: (error) => {
        console.error('Error downloading invoice PDF:', error);
        alert('Failed to download invoice PDF. Please try again later.');
      }
    });
  }

  onViewDetails(invoiceId: string): void {
    this.router.navigate(['/invoice', invoiceId]);
  }

  showPreviousButton(): boolean {
    return this.currentPage > 0;
  }

  showNextButton(): boolean {
    return (this.currentPage + 1) * this.pageSize < this.totalCount;
  }

  onRetry(): void {
    this.loadInvoices();
  }
}
