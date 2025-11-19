import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentListComponent } from './payment-list/payment-list';
import { PaymentFormComponent } from './payment-form/payment-form.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaymentRoutingModule,
    PaymentListComponent,
    PaymentFormComponent
  ],
  exports: [
    PaymentListComponent,
    PaymentFormComponent
  ]
})
export class PaymentModule { }
