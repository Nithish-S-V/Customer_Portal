import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { InvoiceService } from '../invoice.service';
import { AgingSummary, AgingDetail } from '../../shared/models/aging.model';

@Component({
  selector: 'app-aging',
  templateUrl: './aging.component.html',
  styleUrls: ['./aging.component.css'],
  standalone: false
})
export class AgingComponent implements OnInit {
  agingSummary: AgingSummary | null = null;
  agingDetails: AgingDetail[] = [];
  isSummaryLoading: boolean = false;
  isDetailLoading: boolean = false;
  errorMessage: string = '';
  
  // Table columns for the detail view
  displayedColumns: string[] = ['invoiceNumber', 'billingDate', 'dueDate', 'daysOverdue', 'amountDue'];

  constructor(
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Don't load automatically - wait for parent to call loadData()
  }

  loadData(): void {
    this.errorMessage = '';
    this.loadSummary();
    this.loadDetail();
  }

  private loadSummary(): void {
    this.isSummaryLoading = true;
    
    this.invoiceService.getAgingSummary().subscribe({
      next: (data) => {
        this.agingSummary = data;
        this.isSummaryLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading aging summary:', error);
        this.errorMessage = 'Failed to load aging summary.';
        this.isSummaryLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadDetail(): void {
    this.isDetailLoading = true;
    
    this.invoiceService.getAgingDetail().subscribe({
      next: (data) => {
        this.agingDetails = data;
        this.isDetailLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading aging details:', error);
        this.errorMessage = 'Failed to load aging details.';
        this.isDetailLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  retryLoad(): void {
    this.loadData();
  }

  get isLoading(): boolean {
    return this.isSummaryLoading || this.isDetailLoading;
  }
}
