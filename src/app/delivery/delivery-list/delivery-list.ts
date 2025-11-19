import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DeliveryService } from '../delivery';
import { Delivery } from '../../shared/models/delivery.model';

@Component({
  selector: 'app-delivery-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './delivery-list.html',
  styleUrl: './delivery-list.css',
})
export class DeliveryListComponent implements OnInit {
  deliveries: Delivery[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showRetry: boolean = false;
  displayedColumns: string[] = ['deliveryNumber', 'salesOrderReference', 'deliveryDate', 'status', 'trackingNumber', 'actions'];

  constructor(
    private deliveryService: DeliveryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showRetry = false;
    
    this.deliveryService.getDeliveryList()
      .subscribe({
        next: (deliveries) => {
          this.deliveries = deliveries;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load deliveries', error);
          this.errorMessage = 'Failed to load deliveries. Please try again later.';
          this.showRetry = true;
          this.isLoading = false;
        }
      });
  }

  refresh(): void {
    this.loadDeliveries();
  }

  onViewDetails(deliveryNumber: string): void {
    this.router.navigate(['/delivery', deliveryNumber]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Planned':
        return 'status-planned';
      case 'In Transit':
        return 'status-in-transit';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  onRetry(): void {
    this.loadDeliveries();
  }
}
