import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {path:'',component:CreateComponent},
  {path:'file',component:UploadFileComponent},
  {path:'list',component:ListComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdmissionAdminRoutingModule { }
