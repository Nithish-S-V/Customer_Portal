import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceSheetComponent } from './finance-sheet.component';

const routes: Routes = [
  { path: '', component: FinanceSheetComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
