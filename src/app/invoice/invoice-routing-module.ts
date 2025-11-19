import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceList } from './invoice-list/invoice-list';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  { 
    path: '', 
    component: InvoiceList,
    canActivate: [authGuard]
  },
  { 
    path: ':id', 
    component: InvoiceDetailComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
