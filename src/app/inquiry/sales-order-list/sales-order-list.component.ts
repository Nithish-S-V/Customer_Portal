import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InquiryService } from '../inquiry';
import { SalesOrder } from '../../shared/models/sales-order.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-order-list',
  standalone: true,
  imports: [CommonModule, SharedModule, MatButtonModule, MatIconModule],
  templateUrl: './sales-order-list.component.html',
  styleUrls: ['./sales-order-list.component.css']
})
export class SalesOrderListComponent implements OnInit {
  salesOrders: SalesOrder[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showRetry: boolean = false;
  displayedColumns: string[] = ['orderNumber', 'productCode', 'productDescription', 'amount', 'orderDate', 'status'];

  constructor(
    private inquiryService: InquiryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSalesOrders();
  }

  loadSalesOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showRetry = false;
    this.inquiryService.getSalesOrderList().subscribe({
      next: (salesOrders) => {
        this.salesOrders = salesOrders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load sales orders', error);
        this.errorMessage = 'Failed to load sales orders. Please try again later.';
        this.showRetry = true;
        this.isLoading = false;
      }
    });
  }

  onViewDetails(orderNumber: string): void {
    this.router.navigate(['/inquiry/sales-order', orderNumber]);
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

  onRetry(): void {
    this.loadSalesOrders();
  }
}