import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeliveryService } from '../delivery';
import { Delivery, DeliveryLineItem } from '../../shared/models/delivery.model';

@Component({
  selector: 'app-delivery-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './delivery-detail.component.html',
  styleUrl: './delivery-detail.component.css'
})
export class DeliveryDetailComponent implements OnInit {
  delivery: Delivery | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  displayedColumns: string[] = ['itemNumber', 'productCode', 'description', 'quantity', 'shippingInfo'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    const deliveryId = this.route.snapshot.paramMap.get('id');
    if (deliveryId) {
      this.loadDeliveryDetails(deliveryId);
    }
  }

  loadDeliveryDetails(deliveryId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryDetails(deliveryId)
      .subscribe({
        next: (delivery) => {
          this.delivery = delivery;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load delivery details', error);
          this.errorMessage = 'Failed to load delivery details. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  onDownloadDocument(): void {
    // TODO: Implement PDF generation later
    console.log('Download document for delivery:', this.delivery?.deliveryNumber);
  }

  onBackToList(): void {
    this.router.navigate(['/delivery']);
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
}