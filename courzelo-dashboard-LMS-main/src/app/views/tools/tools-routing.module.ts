import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Users} from './users/users.component';
import {InstitutionsComponent} from './institutions/institutions.component';
import { EditComponent } from '../institution/edit/edit.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { UserProfileComponent } from '../pages/user-profile/user-profile.component';

const routes: Routes = [
  {
    path: 'users',
    component: Users
  },
  {
    path: 'institutions',
    component: InstitutionsComponent
  },
  { path: 'edit-user/:id', component: UserEditComponent }
  

    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
