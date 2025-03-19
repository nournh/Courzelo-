import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ForumService} from '../../../shared/services/Forum/forum.service';
import {ThreadResponse} from '../../../shared/models/Forum/ThreadResponse';
import {ToastrService} from 'ngx-toastr';
import {UserResponse} from '../../../shared/models/user/UserResponse';
import {SessionStorageService} from '../../../shared/services/user/session-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateThreadComponent} from './create-thread/create-thread.component';
import {UpdateThreadComponent} from './update-thread/update-thread.component';

@Component({
  selector: 'app-threads-view',
  templateUrl: './threads-view.component.html',
  styleUrls: ['./threads-view.component.scss']
})
export class ThreadsViewComponent implements OnInit {
  institutionID: string;
  ThreadResponse: ThreadResponse[];
  currentThread: ThreadResponse;
  userResponse: UserResponse = this.sessionStorageService.getUserFromSession();
  constructor(      private route: ActivatedRoute,
                  private threadService: ForumService,
                    private toastr: ToastrService,
                    private sessionStorageService: SessionStorageService,
                    private modalService: NgbModal,
                    ) {
}

  ngOnInit(): void {
     this.route.params.subscribe(params => {
      this.institutionID = params['institutionID'];
    });
    this.loadThreads();
}
 loadThreads() {
   this.threadService.getInstitutionThread(this.institutionID).subscribe((data: ThreadResponse[]) => {
         this.ThreadResponse = data;
         console.log(data);
       }, error => {
         if (error.error) {
           this.toastr.error(error.error);
         } else {
           this.toastr.error('An error occurred. Please try again.');
         }
       }
   );
 }

  editThread(thread: ThreadResponse) {
    const modalRef = this.modalService.open(UpdateThreadComponent,
        { size : 'lg', backdrop: false });
    modalRef.componentInstance.thread = thread;
    modalRef.componentInstance.threadUpdated.subscribe(() => {
      this.loadThreads();
      modalRef.close();
    });
  }
  modalConfirmClassFunction(content: any, thread: ThreadResponse) {
    this.currentThread = thread;
    this.modalService.open(content, { ariaLabelledBy: 'confirm class' , backdrop: false })
        .result.then((result) => {
      if (result === 'Ok') {
        this.deleteThread(thread);
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
  deleteThread(thread: ThreadResponse) {
    this.threadService.deleteThread(thread.id).subscribe(() => {
      this.ThreadResponse = this.ThreadResponse.filter(t => t.id !== thread.id);
      this.toastr.success('Thread deleted successfully');
      this.currentThread = null;
    }, error => {
      if (error.error) {
        this.toastr.error(error.error);
      } else {
        this.toastr.error('An error occurred. Please try again.');
      }
      this.currentThread = null;
    });

  }

  createThread() {
    const modalRef = this.modalService.open(CreateThreadComponent,
        { size : 'lg', backdrop: false });
    modalRef.componentInstance.institutionID = this.institutionID;
    modalRef.componentInstance.threadAdded.subscribe(() => {
      this.loadThreads();
      modalRef.close();
    });
  }
}
