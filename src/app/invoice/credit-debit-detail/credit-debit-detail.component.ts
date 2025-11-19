import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { CreditDebitService } from '../../credit-debit/credit-debit.service';

@Component({
  selector: 'app-credit-debit-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './credit-debit-detail.component.html',
  styleUrls: ['./credit-debit-detail.component.css']
})
export class CreditDebitDetailComponent implements OnInit {
  memoHeader: any | null = null;
  memoItems: any[] = [];
  isLoading = true;
  errorMessage = '';
  displayedColumns: string[] = ['itemNumber', 'materialNumber', 'materialDescription', 'billedQuantity', 'netValue'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditDebitService: CreditDebitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const documentNumber = this.route.snapshot.paramMap.get('id');
    if (documentNumber) {
      this.loadMemoDetails(documentNumber);
    } else {
      this.errorMessage = 'No document number provided.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadMemoDetails(documentNumber: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    // Get all memos and filter for the selected document
    this.creditDebitService.getMemos().subscribe({
      next: (memos: any[]) => {
        console.log('[CreditDebitDetail] All memos:', memos);
        console.log('[CreditDebitDetail] Looking for document:', documentNumber);
        
        const memo = memos.find(m => m.documentNumber === documentNumber);
        if (memo) {
          this.memoHeader = memo;
          this.memoItems = memo.items || [];
          console.log('[CreditDebitDetail] Memo found:', memo);
          this.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.errorMessage = `Document ${documentNumber} not found.`;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('[CreditDebitDetail] Error loading memo details:', error);
        this.errorMessage = 'Failed to load document details. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onBackToList(): void {
    this.router.navigate(['/credit-debit']);
  }
}