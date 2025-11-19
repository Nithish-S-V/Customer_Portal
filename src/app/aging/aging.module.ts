import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AgingRoutingModule } from './aging-routing.module';
import { SharedModule } from '../shared/shared.module';

// Component will be moved here
import { AgingComponent } from '../invoice/aging/aging.component';

@NgModule({
  declarations: [
    AgingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AgingRoutingModule
  ],
  exports: [
    AgingComponent
  ]
})
export class AgingModule { }
