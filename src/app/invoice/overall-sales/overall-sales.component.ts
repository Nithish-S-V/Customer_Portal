import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { InvoiceService } from '../invoice.service';

@Component({
  selector: 'app-overall-sales',
  templateUrl: './overall-sales.component.html',
  styleUrls: ['./overall-sales.component.css'],
  standalone: false
})
export class OverallSalesComponent implements OnInit {
  salesData: any[] = [];
  displayedColumns: string[] = ['documentNumber', 'recordType', 'creationDate', 'billingDate', 'netValue'];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOverallSales();
  }

  loadOverallSales(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.invoiceService.getOverallSales().subscribe({
      next: (data) => {
        this.salesData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading overall sales:', error);
        this.errorMessage = 'Failed to load overall sales. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadData(): void {
    this.loadOverallSales();
  }

  retryLoad(): void {
    this.loadOverallSales();
  }
}
