import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { SharedModule } from '../shared/shared.module';
import { InvoiceModule } from '../invoice/invoice-module';
import { InvoiceList } from '../invoice/invoice-list/invoice-list';


@NgModule({
  declarations: [Dashboard],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    InvoiceModule,
    InvoiceList
  ]
})
export class DashboardModule { }
