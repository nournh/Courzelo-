import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolsRoutingModule } from './tools-routing.module';
import { Users } from './users/users.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NgxPaginationModule} from 'ngx-pagination';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {TagInputModule} from 'ngx-chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { InstitutionsComponent } from './institutions/institutions.component';
import {NgbDatepickerModule, NgbModule, NgbPopoverModule} from '@ng-bootstrap/ng-bootstrap';
import {MatTooltipModule} from '@angular/material/tooltip';
import { RoleComponent } from './users/role/role.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';

@NgModule({
    declarations: [
        Users,
        InstitutionsComponent,
        RoleComponent,
        UserEditComponent
        
    ],
    exports: [
        RoleComponent
    ],
    imports: [
        CommonModule,
        ToolsRoutingModule,
        NgxDatatableModule,
        NgxPaginationModule,
        SharedComponentsModule,
        TagInputModule,
        FormsModule,
        ReactiveFormsModule,
        NgbDatepickerModule,
        MatTooltipModule,
        NgbPopoverModule,
        NgbModule
    ]
})
export class ToolsModule { }
