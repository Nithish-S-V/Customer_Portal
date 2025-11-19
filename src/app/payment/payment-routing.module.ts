import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentListComponent } from './payment-list/payment-list';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'list', component: PaymentListComponent, canActivate: [authGuard] },
      { path: 'form', component: PaymentFormComponent, canActivate: [authGuard] },
      { path: '', redirectTo: 'list', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }