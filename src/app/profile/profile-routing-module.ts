import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileViewComponent } from './profile-view/profile-view';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  { path: '', component: ProfileViewComponent, canActivate: [authGuard] },
  { path: 'view', component: ProfileViewComponent, canActivate: [authGuard] },
  { path: 'edit', component: ProfileEditComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
