import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CreditDebitService } from '../../credit-debit/credit-debit.service';

@Component({
  selector: 'app-credit-debit-list',
  templateUrl: './credit-debit-list.component.html',
  styleUrls: ['./credit-debit-list.component.css'],
  standalone: false
})
export class CreditDebitListComponent implements OnInit {
  creditMemos = new MatTableDataSource<any>([]);
  debitMemos = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['documentNumber', 'documentTypeText', 'billingDate', 'netValue', 'actions'];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private creditDebitService: CreditDebitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMemos();
  }

  loadMemos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();
    
    this.creditDebitService.getMemos().subscribe({
      next: (data) => {
        console.log('[CreditDebitList] Memos loaded:', data);
        
        // Filter memos into credit and debit based on document type
        // G2 = Credit Memo, L2 = Debit Memo (SAP standard document types)
        const creditData = data.filter((memo: any) => memo.documentType === 'G2');
        const debitData = data.filter((memo: any) => memo.documentType === 'L2');
        
        // Update MatTableDataSource - this properly triggers table rendering
        this.creditMemos.data = creditData;
        this.debitMemos.data = debitData;
        
        console.log('[CreditDebitList] Credit memos:', creditData.length);
        console.log('[CreditDebitList] Debit memos:', debitData.length);
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[CreditDebitList] Error loading memos:', error);
        this.errorMessage = 'Failed to load credit/debit memos. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  retryLoad(): void {
    this.loadMemos();
  }
}
