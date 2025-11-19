import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InvoiceRoutingModule } from './invoice-routing-module';
import { InvoiceList } from './invoice-list/invoice-list';
import { OverallSalesComponent } from './overall-sales/overall-sales.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    OverallSalesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    InvoiceRoutingModule,
    InvoiceList
  ],
  exports: [
    InvoiceList,
    OverallSalesComponent
  ]
})
export class InvoiceModule { }
