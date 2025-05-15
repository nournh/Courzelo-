import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './shared/services/auth-guard.service';
import { BlankLayoutComponent } from './shared/components/layouts/blank-layout/blank-layout.component';
import { AdminLayoutSidebarCompactComponent } from './shared/components/layouts/admin-layout-sidebar-compact/admin-layout-sidebar-compact.component';
import { AddChallengeComponent } from './views/Business/add-challenge/add-challenge.component';
import { DisplayChallengesComponent } from './views/Business/display-challenges/display-challenges.component';
import {NoAuthGuard} from './shared/services/no-auth.guard';
import { DashboardProjectComponent } from './shared/components/Project/Admin/dashboard-project/dashboard-project.component';
import { AddProjectComponent } from './shared/components/Project/Admin/add-project/add-project.component';
import { ViewdetailsComponent } from './shared/components/Project/Admin/viewdetails/viewdetails.component';
import { PdfComponent } from './shared/components/Project/User/pdf/pdf.component';
import { UploadFileComponent } from './views/Admission/upload-file/upload-file.component';
import { ProjectCalendarComponent } from './shared/components/Project/User/project-calendar/project-calendar.component';
import { ProjectComponent } from './shared/components/Project/User/project/project.component';
import { ProjectDetailsComponent } from './shared/components/Project/User/projectdetails/projectdetails.component';
import { ProgressDashboardComponent } from './shared/components/Project/User/progress-dashboard/progress-dashboard.component';
import { PublicationComponent } from './shared/components/Project/User/publication/publication.component';
import { RevisionComponent } from './shared/components/Revision/Teacher/revision/revision.component';
import { ConsultRevisionComponent } from './shared/components/Revision/Teacher/consult-revision/consult-revision.component';
import { ClientRevisionComponent } from './shared/components/Revision/User/client-revision/client-revision.component';
import { ParticipateRevisionComponent } from './shared/components/Revision/User/participate-revision/participate-revision.component';
import { QuizrevisionComponent } from './shared/components/Revision/User/quizrevision/quizrevision.component';
import { EditComponent } from './views/institution/edit/edit.component';
import { UserEditComponent } from './views/tools/users/user-edit/user-edit.component';
import { AddJobDialogComponent } from './views/Business/add-job-dialog/add-job-dialog.component';
import { ApplyJobComponent } from './views/Business/apply-job/apply-job.component';
import { JobOffersComponent } from './views/Business/job-offers/job-offers.component';
import { UpdJobDialogComponent } from './views/Business/upd-job-dialog/upd-job-dialog.component';
import { ViewApplicationsDialogComponent } from './views/Business/view-applications-dialog/view-applications-dialog.component';
import { ViewJobDialogComponent } from './views/Business/view-job-dialog/view-job-dialog.component';
import { CandidateJobComponent } from './views/Business/candidate-job/candidate-job.component';
import { AssignedChallengesComponent } from './views/Business/assigned-challenges/assigned-challenges.component';
import { CandidateApplicationsComponent } from './views/Business/candidate-applications/candidate-applications.component';
import { AssignTestDialogComponent } from './views/Business/assign-test-dialog/assign-test-dialog.component';
import { MyChallengesComponent } from './views/Business/my-challenges/my-challenges.component';
import { ViewSubmissionsComponent } from './views/Business/view-submissions/view-submissions.component';
import { AddTestComponent } from './views/Business/add-test/add-test.component';
const userRoutes: Routes = [
    {
      path: 'dashboard',
      loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
      path: 'tickets',
      loadChildren: () => import('./views/tickets/tickets.module').then(m => m.TicketsModule)
    },
    {
      path: 'mailing',
      loadChildren: () => import('./views/Mail/mail.module').then(m => m.MailModule)
    },
    {
      path: 'ticketsStudent',
      loadChildren: () => import('./views/ticketsStudent/ticket-student.module').then(m => m.TicketStudentModule)
    },
    {
      path: 'uikits',
      loadChildren: () => import('./views/ui-kits/ui-kits.module').then(m => m.UiKitsModule)
    },
    {
      path: 'forms',
      loadChildren: () => import('./views/forms/forms.module').then(m => m.AppFormsModule)
    },
    {
      path: 'chatgroups',
      loadChildren: () => import('./views/groups/groups.module').then(m => m.GroupsModule)
    },
    
    {
      path: 'invoice',
      loadChildren: () => import('./views/invoice/invoice.module').then(m => m.InvoiceModule)
    },
    {
      path: 'inbox',
      loadChildren: () => import('./views/inbox/inbox.module').then(m => m.InboxModule)
    },
    {
      path: 'calendar',
      loadChildren: () => import('./views/calendar/calendar.module').then(m => m.CalendarAppModule)
    },
    {
      path: 'chat',
      loadChildren: () => import('./views/chat/chat.module').then(m => m.ChatModule)
    },
    {
      path: 'contacts',
      loadChildren: () => import('./views/contacts/contacts.module').then(m => m.ContactsModule)
    },
    {
      path: 'admission',
      loadChildren: () => import('./views/Admission/list.module').then(m => m.ListModule)
    },
    {
      path: 'admissionadmin',
      loadChildren: () => import('./views/AdmissionAdmin/admission-admin.module').then(m => m.AdmissionAdminModule)
    },
    {
      path: 'admissionteacher',
      loadChildren: () => import('./views/AdmissionTeacher/admissionteacher.module').then(m => m.AdmissionteacherModule)
    },
    {
      path: 'studentadmission',
      loadChildren: () => import('./views/AdmissionStudent/admissionstudent.module').then(m => m.AdmissionstudentModule)
    },
    {
      path: 'tables',
      loadChildren: () => import('./views/data-tables/data-tables.module').then(m => m.DataTablesModule)
    },
    {
      path: 'pages',
      loadChildren: () => import('./views/pages/pages.module').then(m => m.PagesModule)
    },
    {
      path: 'transports',
      loadChildren: () => import('./views/transports/transports.module').then(m => m.TransportsModule)
    },
    {
      path: 'stages',
      loadChildren: () => import('./views/stages/stages.module').then(m => m.StagesModule)
    },
    {
        path: 'icons',
        loadChildren: () => import('./views/icons/icons.module').then(m => m.IconsModule)
    } ,
    { path: 'getallprojects', component: ProjectComponent},
    { path: 'ProgressDashboard', component: ProgressDashboardComponent},
    { path: 'projects', component: DashboardProjectComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] }},
    { path: 'addprojects', component: AddProjectComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] }},
    { path: 'project/:id', component: ViewdetailsComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] }},
    { path: 'pdf', component: PdfComponent },
    { path: 'uploadfile', component: UploadFileComponent},

    { path: 'projects', component: DashboardProjectComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] }}, // teacher
    { path: 'addprojects', component: AddProjectComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] }}, // teacher
    { path: 'project/:id', component: ViewdetailsComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] }}, // teacher

    { path: 'pdf', component: PdfComponent},
    { path: 'projectcalendar/:id', component: ProjectCalendarComponent , canActivate: [AuthGuard] }, // user
    { path: 'getallprojects', component: ProjectComponent, canActivate: [AuthGuard]}, // user
    { path: 'projectdetails/:id', component: ProjectDetailsComponent, canActivate: [AuthGuard]}, // user
    { path: 'ProgressDashboard/:id', component: ProgressDashboardComponent, canActivate: [AuthGuard]}, // user
    { path: 'publication/:id', component: PublicationComponent, canActivate: [AuthGuard]}, // user

     { path: 'revision', component: RevisionComponent, canActivate: [AuthGuard], data: { roles: ['TEACHER'] } }, // teacher
     { path: 'consultrevision/:id', component: ConsultRevisionComponent,
         canActivate: [AuthGuard], data: { roles: ['TEACHER'] } }, // teacher
     { path: 'clientrevision', component: ClientRevisionComponent
      }, // user
     { path: 'participaterevision/:id', component: ParticipateRevisionComponent , canActivate: [AuthGuard]}, // user
     { path: 'QandA/:id', component: QuizrevisionComponent , canActivate: [AuthGuard]}, // user
  
      { path: 'edit-user/:id', component: UserEditComponent},
        //PROFESSIONAL 
      { path: 'jobOffers', component: JobOffersComponent  },
      { path: 'CandidateJob', component: CandidateJobComponent  },
      { path: 'apply-job/:idJob/:idCandidate', component: ApplyJobComponent }, // <-- your route
       { path: 'assigned-challenges', component: AssignedChallengesComponent },
  { path: 'Myapplications', component: CandidateApplicationsComponent },
    { path: 'add-test', component: AddTestComponent },
      {
        path: 'view-applications/:id',component: ViewApplicationsDialogComponent },
       
        { path: 'add-test/:idJob', component: AssignTestDialogComponent },
        { path: 'addChallenge', component: AddChallengeComponent },
        { path: 'challenges', component: DisplayChallengesComponent },
        {
          path: 'recruiter/challenges',component: MyChallengesComponent
        },

    {  path:  'challenges/:challengeId/submissions',component: ViewSubmissionsComponent},
     

    {
        path: 'settings',
        loadChildren: () => import('./views/settings/settings.module').then(m => m.SettingsModule)
    },
    {
      path: 'forum',
      loadChildren: () => import('./views/Forum/forum.module').then(m => m.ForumModule)
  },
    {
        path: 'tools',
        loadChildren: () => import('./views/tools/tools.module').then(m => m.ToolsModule),
        canActivate: [AuthGuard],
        data: { roles: ['SUPERADMIN'] }
    },
    {
        path: 'institution',
        loadChildren: () => import('./views/institution/institution.module').then(m => m.InstitutionModule),
        canActivate: [AuthGuard],
    },
    {
        path: 'home',
        loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule),
        canActivate: [AuthGuard],
    }

  ];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
          canLoad: [NoAuthGuard],
          loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule)
      }
    ]
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      {
        path: 'others',
        loadChildren: () => import('./views/others/others.module').then(m => m.OthersModule)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutSidebarCompactComponent,
    canActivate: [AuthGuard],
    children: userRoutes,
  },

  {
    path: '**',
    redirectTo: 'others/404'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
