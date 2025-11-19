import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryListComponent } from './delivery-list/delivery-list';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DeliveryRoutingModule,
    DeliveryListComponent,
    DeliveryDetailComponent
  ],
  exports: [
    DeliveryListComponent,
    DeliveryDetailComponent
  ]
})
export class DeliveryModule { }
