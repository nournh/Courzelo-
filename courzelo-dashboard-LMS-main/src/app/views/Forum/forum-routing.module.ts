// forum-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ThreadsViewComponent} from './threads-view/threads-view.component';
import {ThreadPostsViewComponent} from './thread-posts-view/thread-posts-view.component';
import {ThreadPostViewComponent} from './thread-post-view/thread-post-view.component';

const routes: Routes = [
  {
    path: ':institutionID',
    component: ThreadsViewComponent
  },
  {
    path: ':threadID/posts',
    component: ThreadPostsViewComponent
  },
  {
    path: 'post/:postID',
    component: ThreadPostViewComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule { }
