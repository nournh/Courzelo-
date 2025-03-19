import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

import { ForumRoutingModule } from './forum-routing.module';

import { ThreadsViewComponent } from './threads-view/threads-view.component';
import { CreateThreadComponent } from './threads-view/create-thread/create-thread.component';
import { UpdateThreadComponent } from './threads-view/update-thread/update-thread.component';
import { ThreadPostsViewComponent } from './thread-posts-view/thread-posts-view.component';
import {NgxPaginationModule} from "ngx-pagination";
import { CreatePostComponent } from './thread-posts-view/create-post/create-post.component';
import { UpdatePostComponent } from './thread-posts-view/update-post/update-post.component';
import { ThreadPostViewComponent } from './thread-post-view/thread-post-view.component';

@NgModule({
  declarations: [
         ThreadsViewComponent,
         CreateThreadComponent,
         UpdateThreadComponent,
         ThreadPostsViewComponent,
         CreatePostComponent,
         UpdatePostComponent,
         ThreadPostViewComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule, // Ensure ReactiveFormsModule is imported here
        NgbModule,
        NgxDatatableModule,
        NgxEchartsModule,
        SharedComponentsModule,
        ForumRoutingModule,
        NgxPaginationModule
    ]
})
export class ForumModule { }
