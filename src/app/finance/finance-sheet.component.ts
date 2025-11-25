import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { InvoiceList } from '../invoice/invoice-list/invoice-list';
import { CreditDebitListComponent } from '../invoice/credit-debit-list/credit-debit-list.component';
import { AgingComponent } from '../invoice/aging/aging.component';
import { OverallSalesComponent } from '../invoice/overall-sales/overall-sales.component';

@Component({
  selector: 'app-finance-sheet',
  templateUrl: './finance-sheet.component.html',
  styleUrls: ['./finance-sheet.component.css'],
  standalone: false
})
export class FinanceSheetComponent implements AfterViewInit {
  @ViewChild('invoiceList') invoiceListComponent!: InvoiceList;
  @ViewChild('creditDebitList') creditDebitListComponent!: CreditDebitListComponent;
  @ViewChild('aging') agingComponent!: AgingComponent;
  @ViewChild('overallSales') overallSalesComponent!: OverallSalesComponent;

  private loadedTabs = new Set<number>();

  ngAfterViewInit() {
    // Mark first tab as loaded since InvoiceList loads automatically in ngOnInit
    this.loadedTabs.add(0);
  }

  onTabChange(event: MatTabChangeEvent) {
    // Only load data if this tab hasn't been loaded before
    if (this.loadedTabs.has(event.index)) {
      return;
    }

    switch (event.index) {
      case 1: // Credit/Debit tab
        if (this.creditDebitListComponent && this.creditDebitListComponent.loadMemos) {
          this.creditDebitListComponent.loadMemos();
          this.loadedTabs.add(1);
        }
        break;
      case 2: // Aging tab
        if (this.agingComponent && this.agingComponent.loadData) {
          this.agingComponent.loadData();
          this.loadedTabs.add(2);
        }
        break;
      case 3: // Overall Sales tab
        if (this.overallSalesComponent && this.overallSalesComponent.loadData) {
          this.overallSalesComponent.loadData();
          this.loadedTabs.add(3);
        }
        break;
    }
  }
}
