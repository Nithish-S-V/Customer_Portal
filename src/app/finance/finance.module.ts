import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceSheetComponent } from './finance-sheet.component';
import { InvoiceModule } from '../invoice/invoice-module';
import { CreditDebitModule } from '../credit-debit/credit-debit.module';
import { AgingModule } from '../aging/aging.module';

@NgModule({
  declarations: [
    FinanceSheetComponent
  ],
  imports: [
    CommonModule,
    FinanceRoutingModule,
    MatTabsModule,
    MatCardModule,
    InvoiceModule,
    CreditDebitModule,
    AgingModule
  ]
})
export class FinanceModule { }
