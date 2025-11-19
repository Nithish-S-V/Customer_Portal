import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryListComponent } from './delivery-list/delivery-list';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: DeliveryListComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id',
    component: DeliveryDetailComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryRoutingModule { }