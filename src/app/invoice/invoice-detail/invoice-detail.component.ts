import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Invoice } from '../../shared/models/invoice.model';
import { InvoiceService } from '../invoice.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  invoiceHeader: Invoice | null = null;
  invoiceItems: Invoice[] = [];
  invoiceId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  displayedColumns: string[] = ['itemNumber', 'materialNumber', 'materialDescription', 'netValue', 'currency'];
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    const documentId = this.route.snapshot.paramMap.get('id');
    
    if (documentId) {
      this.invoiceId = documentId;
      
      // Subscribe to the invoice list from the service's BehaviorSubject
      this.subscription = this.invoiceService.invoiceList$.subscribe(allItems => {
        if (allItems.length > 0) {
          // Filter the items for the current document ID
          const filteredItems = allItems.filter(item => item.documentNumber === documentId);
          
          if (filteredItems.length > 0) {
            this.invoiceItems = filteredItems;
            this.invoiceHeader = filteredItems[0]; // Header is the first item
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Invoice not found.';
          }
          
          // IMPORTANT: Set loading to false AFTER processing is done
          this.isLoading = false;
        } else {
          // If allItems is empty, try to fetch the data
          this.loadInvoiceDetails();
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'No invoice ID provided.';
    }
  }

  loadInvoiceDetails(): void {
    // Fallback: fetch data if not already loaded
    this.invoiceService.getInvoiceList(0, 1000).subscribe({
      next: (response) => {
        // The tap operator in the service will update the BehaviorSubject
        // The subscription above will handle the filtering
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load invoice details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading invoice details:', error);
      }
    });
  }

  onViewForm(): void {
    console.log('Downloading PDF for invoice:', this.invoiceId);
    
    this.invoiceService.downloadInvoicePdf(this.invoiceId).subscribe({
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

  onBackToList(): void {
    this.router.navigate(['/invoice']);
  }

  onRetry(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadInvoiceDetails();
  }

  ngOnDestroy(): void {
    // Prevent memory leaks
    this.subscription.unsubscribe();
  }
}