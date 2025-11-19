import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { InquiryService } from '../inquiry';
import { SalesOrder } from '../../shared/models/sales-order.model';

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './sales-order-detail.component.html',
  styleUrls: ['./sales-order-detail.component.css']
})
export class SalesOrderDetailComponent implements OnInit {
  salesOrder: SalesOrder | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  displayedColumns: string[] = ['itemNumber', 'productCode', 'description', 'quantity', 'unitPrice', 'totalPrice'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inquiryService: InquiryService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadSalesOrderDetails(orderId);
    }
  }

  loadSalesOrderDetails(orderId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.inquiryService.getSalesOrderDetails(orderId).subscribe({
      next: (salesOrder) => {
        this.salesOrder = salesOrder;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load sales order details', error);
        this.errorMessage = 'Failed to load sales order details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onBackToList(): void {
    this.router.navigate(['/inquiry/sales-orders']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Process':
        return 'status-in-process';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}