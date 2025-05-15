import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPaginationModule } from 'ngx-pagination';
import { TicketsRoutingModule } from './views/tickets/tickets-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {Interceptor} from './shared/services/user/Interceptor';
import { ForumRoutingModule } from './views/Forum/forum-routing.module';
import { DossierComponent } from './views/dossier/dossier.component';
import { UploadFileComponent } from './views/Admission/upload-file/upload-file.component';
import { AddProjectComponent } from './shared/components/Project/Admin/add-project/add-project.component';
import { DashboardProjectComponent } from './shared/components/Project/Admin/dashboard-project/dashboard-project.component';
import { ViewdetailsComponent } from './shared/components/Project/Admin/viewdetails/viewdetails.component';
import { PdfComponent } from './shared/components/Project/User/pdf/pdf.component';
import { ProjectComponent } from './shared/components/Project/User/project/project.component';
import { ProjectDetailsComponent } from './shared/components/Project/User/projectdetails/projectdetails.component';
import { ProgressDashboardComponent } from './shared/components/Project/User/progress-dashboard/progress-dashboard.component';
import { ProjectCalendarComponent } from './shared/components/Project/User/project-calendar/project-calendar.component';
import { PublicationComponent } from './shared/components/Project/User/publication/publication.component';
import { AddpublicationComponent } from './shared/components/Project/User/addpublication/addpublication.component';
import { RevisionComponent } from './shared/components/Revision/Teacher/revision/revision.component';
import { AddRevisionComponent } from './shared/components/Revision/Teacher/add-revision/add-revision.component';
import { ModifyRevisionComponent } from './shared/components/Revision/Teacher/modify-revision/modify-revision.component';
import { ConsultRevisionComponent } from './shared/components/Revision/Teacher/consult-revision/consult-revision.component';
import { ClientRevisionComponent } from './shared/components/Revision/User/client-revision/client-revision.component';
import { ParticipateRevisionComponent } from './shared/components/Revision/User/participate-revision/participate-revision.component';
import { QuizrevisionComponent } from './shared/components/Revision/User/quizrevision/quizrevision.component';
import { CalendarFormProjectComponent } from './shared/components/Project/User/calendar-form-project/calendar-form-project.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarRoutingModule } from './views/calendar/calendar-routing.module';
import { SharedDirectivesModule } from './shared/directives/shared-directives.module';
import { SharedPipesModule } from './shared/pipes/shared-pipes.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DataTablesRoutingModule } from './views/data-tables/data-tables-routing.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AddJobDialogComponent } from './views/Business/add-job-dialog/add-job-dialog.component';
import { ApplyJobComponent } from './views/Business/apply-job/apply-job.component';
import { JobOffersComponent } from './views/Business/job-offers/job-offers.component';
import { UpdJobDialogComponent } from './views/Business/upd-job-dialog/upd-job-dialog.component';
import { ViewApplicationsDialogComponent } from './views/Business/view-applications-dialog/view-applications-dialog.component';
import { ViewJobDialogComponent } from './views/Business/view-job-dialog/view-job-dialog.component';
import { CandidateJobComponent } from './views/Business/candidate-job/candidate-job.component';
import { AddChallengeComponent } from './views/Business/add-challenge/add-challenge.component';
import { AssignTestDialogComponent } from './views/Business/assign-test-dialog/assign-test-dialog.component';
import { AssignedChallengesComponent } from './views/Business/assigned-challenges/assigned-challenges.component';
import { CandidateApplicationsComponent } from './views/Business/candidate-applications/candidate-applications.component';
import { DisplayChallengesComponent } from './views/Business/display-challenges/display-challenges.component';
import { EditChallengeComponent } from './views/Business/edit-challenge/edit-challenge.component';
import { ViewSubmissionsComponent } from './views/Business/view-submissions/view-submissions.component';
import { MyChallengesComponent } from './views/Business/my-challenges/my-challenges.component';

@NgModule({
  declarations: [
    AppComponent,
    AddProjectComponent,
    DashboardProjectComponent,
    ViewdetailsComponent ,
    PdfComponent,
    DossierComponent,
    UploadFileComponent,
    ProjectComponent,
    ProjectDetailsComponent,
    ProgressDashboardComponent,
   ProjectCalendarComponent ,
   PublicationComponent,
   AddpublicationComponent,
  RevisionComponent,
   AddRevisionComponent,
   ModifyRevisionComponent,
   ConsultRevisionComponent,
   ClientRevisionComponent,
   ParticipateRevisionComponent,
   QuizrevisionComponent,
CalendarFormProjectComponent,
AddJobDialogComponent,
ApplyJobComponent,
JobOffersComponent,
ViewApplicationsDialogComponent,
ViewJobDialogComponent,
UpdJobDialogComponent,
CandidateJobComponent,
AddChallengeComponent,
AssignTestDialogComponent,
AssignedChallengesComponent,
CandidateApplicationsComponent,
DisplayChallengesComponent,
EditChallengeComponent,
ViewSubmissionsComponent,
MyChallengesComponent


  ],
  imports: [
    NgxPaginationModule,
    NgxDatatableModule,
    BrowserModule,
    SharedModule,
    HttpClientModule,
    BrowserAnimationsModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }),
    AppRoutingModule ,
    CommonModule,
    ReactiveFormsModule ,
    FormsModule,
    ForumRoutingModule,
    TicketsRoutingModule,
    MatDialogModule,
    MatIconModule,
    NgbModule,
    ColorPickerModule,
    CalendarRoutingModule ,
    NgbDatepickerModule,
    SharedDirectivesModule,
    SharedPipesModule,
    PerfectScrollbarModule,
    DataTablesRoutingModule,
       // other modules...
       CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory
      }),
      CalendarRoutingModule
  ],

  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
     {
      provide: HTTP_INTERCEPTORS,
       useClass: Interceptor,
       multi: true
     },
    {
        provide: DatePipe
    }
  ]
})
export class AppModule { }
