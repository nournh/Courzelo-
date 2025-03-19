import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdmissionteacherRoutingModule } from './admissionteacher-routing.module';
import { NoteApplicationComponent } from './note-application/note-application.component';
import { ListAdmissionComponent } from './list-admission/list-admission.component';
import { ScheduleComponent } from './schedule/schedule.component';


@NgModule({
  declarations: [
    NoteApplicationComponent,
    ListAdmissionComponent,
    ScheduleComponent
  ],
  imports: [
    CommonModule,
    AdmissionteacherRoutingModule
  ]
})
export class AdmissionteacherModule { }
