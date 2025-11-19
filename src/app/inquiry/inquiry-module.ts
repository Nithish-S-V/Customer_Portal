import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { InquiryRoutingModule } from './inquiry-routing.module';
import { InquiryFormComponent } from './inquiry-form/inquiry-form';
import { SalesOrderListComponent } from './sales-order-list/sales-order-list.component';
import { SalesOrderDetailComponent } from './sales-order-detail/sales-order-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InquiryRoutingModule,
    InquiryFormComponent,
    SalesOrderListComponent,
    SalesOrderDetailComponent
  ],
  exports: [
    InquiryFormComponent,
    SalesOrderListComponent,
    SalesOrderDetailComponent
  ]
})
export class InquiryModule { }
