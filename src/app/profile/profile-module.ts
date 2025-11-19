import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ProfileViewComponent } from './profile-view/profile-view';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileRoutingModule } from './profile-routing-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutingModule,
    ProfileViewComponent,
    ProfileEditComponent
  ],
  exports: [
    ProfileViewComponent,
    ProfileEditComponent
  ]
})
export class ProfileModule { }
