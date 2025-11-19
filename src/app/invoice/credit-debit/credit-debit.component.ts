import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreditDebitNote } from '../../shared/models/credit-debit.model';
import { InvoiceService } from '../invoice.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-credit-debit',
  templateUrl: './credit-debit.component.html',
  styleUrls: ['./credit-debit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule
  ]
})
export class CreditDebitComponent implements OnInit {
  creditNotes: CreditDebitNote[] = [];
  debitNotes: CreditDebitNote[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedTabIndex: number = 0;
  isAdmin: boolean = false;

  displayedColumns: string[] = ['documentNumber', 'invoiceReference', 'amount', 'reason', 'date', 'actions'];

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadCreditDebitData();
  }

  checkUserRole(): void {
    const userRole = this.authService.getUserRole();
    this.isAdmin = userRole === 'Admin';
  }

  loadCreditDebitData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load credit notes
    this.invoiceService.getCreditDebitNotes('CREDIT').subscribe({
      next: (creditNotes: any) => {
        this.creditNotes = creditNotes;
        this.loadDebitNotes();
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load credit notes. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private loadDebitNotes(): void {
    this.invoiceService.getCreditDebitNotes('DEBIT').subscribe({
      next: (debitNotes: any) => {
        this.debitNotes = debitNotes;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load debit notes. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  onViewDetails(documentNumber: string): void {
    // Navigate to credit/debit detail component (to be implemented in next task)
    this.router.navigate(['/invoice/credit-debit', documentNumber]);
  }

  onRequestCreditDebit(): void {
    // Navigate to inquiry form for credit/debit request
    this.router.navigate(['/inquiry']);
  }

  onRetry(): void {
    this.loadCreditDebitData();
  }

  getCurrentData(): CreditDebitNote[] {
    return this.selectedTabIndex === 0 ? this.creditNotes : this.debitNotes;
  }

  getCurrentTabTitle(): string {
    return this.selectedTabIndex === 0 ? 'Credit Notes' : 'Debit Notes';
  }
}