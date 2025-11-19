import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreditDebitRoutingModule } from './credit-debit-routing.module';
import { SharedModule } from '../shared/shared.module';

// Import standalone components
import { CreditDebitComponent } from '../invoice/credit-debit/credit-debit.component';
import { CreditDebitListComponent } from '../invoice/credit-debit-list/credit-debit-list.component';
import { CreditDebitDetailComponent } from '../invoice/credit-debit-detail/credit-debit-detail.component';

@NgModule({
  declarations: [
    CreditDebitListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CreditDebitRoutingModule,
    CreditDebitComponent,
    CreditDebitDetailComponent
  ],
  exports: [
    CreditDebitListComponent
  ]
})
export class CreditDebitModule { }
