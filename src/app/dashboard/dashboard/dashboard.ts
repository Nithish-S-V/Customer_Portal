import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService, DashboardSummary } from '../dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: false
})
export class Dashboard implements OnInit {
  dashboardSummary: DashboardSummary = {
    totalInquiries: 0,
    totalSalesOrders: 0,
    totalDeliveries: 0,
    totalInvoices: 0,
    totalOverallSales: 0
  };
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('[Dashboard] Constructor called');
  }

  ngOnInit(): void {
    console.log('[Dashboard] ngOnInit called');
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('[Dashboard] loadDashboardData called');
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('[Dashboard] Calling dashboardService.getDashboardSummary()');
    this.dashboardService.getDashboardSummary().subscribe({
      next: (summary) => {
        console.log('[Dashboard] Data received:', summary);
        this.dashboardSummary = summary;
        this.isLoading = false;
        this.cdr.detectChanges(); // CRITICAL FIX: Manually trigger UI update
      },
      error: (error) => {
        console.error('[Dashboard] Error loading dashboard data:', error);
        this.errorMessage = 'Failed to load dashboard data. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges(); // Also trigger on error
      }
    });
  }

  retryLoad(): void {
    this.loadDashboardData();
  }
}
