import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgingComponent } from '../invoice/aging/aging.component';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  { 
    path: '', 
    component: AgingComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgingRoutingModule { }
