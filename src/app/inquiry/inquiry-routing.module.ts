import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../auth/auth-guard';
import { InquiryFormComponent } from './inquiry-form/inquiry-form';
import { SalesOrderListComponent } from './sales-order-list/sales-order-list.component';
import { SalesOrderDetailComponent } from './sales-order-detail/sales-order-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./inquiry-list/inquiry-list.component').then(m => m.InquiryListComponent),
    canActivate: [authGuard] 
  },
  { path: 'form', component: InquiryFormComponent, canActivate: [authGuard] },
  { path: 'sales-orders', component: SalesOrderListComponent, canActivate: [authGuard] },
  { path: 'sales-order/:id', component: SalesOrderDetailComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InquiryRoutingModule { }