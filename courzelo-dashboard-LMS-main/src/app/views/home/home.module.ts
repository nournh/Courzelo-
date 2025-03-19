import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import { MyGradesComponent } from './home-dashboard/my-grades/my-grades.component';
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    HomeDashboardComponent,
    MyGradesComponent,
  ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        SharedComponentsModule,
        FormsModule
    ]
})
export class HomeModule { }
