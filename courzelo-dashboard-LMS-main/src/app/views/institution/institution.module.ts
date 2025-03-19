import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InstitutionRoutingModule} from './institution-routing.module';
import {UsersComponent} from './users/users.component';
import {EditComponent} from './edit/edit.component';
import {HomeComponent} from './home/home.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {
    NgbDatepickerModule,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavLink,
    NgbNavOutlet
} from '@ng-bootstrap/ng-bootstrap';
import {ClassroomComponent, TimeRemainingPipe} from './classroom/classroom.component';
import { ClassComponent } from './class/class.component';
import { InvitationsComponent } from './invitations/invitations.component';
import {TagInputModule} from 'ngx-chips';
import {ToolsModule} from '../tools/tools.module';
import { ProgramsComponent } from './programs/programs.component';
import { AddProgramComponent } from './programs/add-program/add-program.component';
import { EditProgramComponent } from './programs/edit-program/edit-program.component';
import { CoursesComponent } from './courses/courses.component';
import { AddCourseComponent } from './courses/add-course/add-course.component';
import { EditCourseComponent } from './courses/edit-course/edit-course.component';
import { AddClassComponent } from './class/add-class/add-class.component';
import { EditClassComponent } from './class/edit-class/edit-class.component';
import { ViewCoursesComponent } from './class/view-courses/view-courses.component';
import { AssignTeacherComponent } from './class/view-courses/assign-teacher/assign-teacher.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ManageAssessmentComponent } from './courses/manage-assessment/manage-assessment.component';
import { StudentGradesComponent } from '../../shared/components/student-grades/student-grades.component';
import { GenerateCalendarComponent } from './programs/generate-calendar/generate-calendar.component';
import { TeacherTimeslotsComponent } from './users/teacher-timeslots/teacher-timeslots.component';
import { UpdateSkillsComponent } from './users/update-skills/update-skills.component';
import { ViewCoursePartsComponent } from './courses/view-course-parts/view-course-parts.component';
import { ModulesComponent } from './modules/modules.component';
import { AddModuleComponent } from './modules/add-module/add-module.component';
import { EditModuleComponent } from './modules/edit-module/edit-module.component';


@NgModule({
  declarations: [
    UsersComponent,
    EditComponent,
    HomeComponent,
    ClassroomComponent,
    ClassComponent,
    InvitationsComponent,
    ProgramsComponent,
    AddProgramComponent,
    EditProgramComponent,
    CoursesComponent,
    AddCourseComponent,
    EditCourseComponent,
    AddClassComponent,
    EditClassComponent,
    ViewCoursesComponent,
    AssignTeacherComponent,
    ManageAssessmentComponent,
    GenerateCalendarComponent,
    TeacherTimeslotsComponent,
    UpdateSkillsComponent,
    ViewCoursePartsComponent,
    ModulesComponent,
    AddModuleComponent,
    EditModuleComponent,
  ],
    imports: [
        CommonModule,
        InstitutionRoutingModule,
        NgxPaginationModule,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        SharedComponentsModule,
        NgbDatepickerModule,
        TimeRemainingPipe,
        TagInputModule,
        ToolsModule,
        NgbNavOutlet,
        NgbNavItem,
        NgbNavLink,
        NgbNavContent,
        NgbNav,
        MatAutocompleteModule
    ]
})
export class InstitutionModule { }
