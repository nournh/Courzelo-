import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboadDefaultComponent } from './dashboad-default/dashboad-default.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { DashboardV2Component } from './dashboard-v2/dashboard-v2.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardV3Component } from './dashboard-v3/dashboard-v3.component';
import { DashboardV4Component } from './dashboard-v4/dashboard-v4.component';
import { TransportsComponent } from './transports/transports.component';
import { AppFormsModule } from '../forms/forms.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StagesComponent } from './stages/stages.component';
import { DashboardV5Component } from './dashboard-v5/dashboard-v5.component';

@NgModule({
  imports: [
    CommonModule,
    SharedComponentsModule,
    NgxEchartsModule,
    NgxDatatableModule,
    NgbModule,
    DashboardRoutingModule,
    AppFormsModule,
    ReactiveFormsModule
  ],
  declarations: [StagesComponent, TransportsComponent, DashboadDefaultComponent,
    DashboardV2Component, DashboardV3Component, DashboardV4Component, DashboardV5Component]
})
export class DashboardModule { }
