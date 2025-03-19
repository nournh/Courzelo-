import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdmissionAdminRoutingModule } from './admission-admin-routing.module';
import { CreateComponent } from './create/create.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { ListComponent } from './list/list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AcceptComponent } from './accept/accept.component';


@NgModule({
  declarations: [
    CreateComponent,
    UploadFileComponent,
    ListComponent,
    AcceptComponent,
    
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    AdmissionAdminRoutingModule,
    NgbDatepickerModule
  ]
})
export class AdmissionAdminModule { }
