import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditDebitListComponent } from '../invoice/credit-debit-list/credit-debit-list.component';
import { CreditDebitDetailComponent } from '../invoice/credit-debit-detail/credit-debit-detail.component';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  { 
    path: '', 
    component: CreditDebitListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'detail/:id', 
    component: CreditDebitDetailComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditDebitRoutingModule { }
