import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {SessionStorageService} from '../../../shared/services/user/session-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PostService} from '../../../shared/services/Forum/post.service';
import {UserResponse} from '../../../shared/models/user/UserResponse';
import {FormControl} from '@angular/forms';
import {PaginatedPostsResponse} from '../../../shared/models/Forum/PaginatedPostsResponse';
import {PostResponse} from '../../../shared/models/Forum/PostResponse';
import {CreatePostComponent} from './create-post/create-post.component';
import {debounceTime} from 'rxjs/operators';
import {UpdatePostComponent} from "./update-post/update-post.component";

@Component({
  selector: 'app-thread-posts-view',
  templateUrl: './thread-posts-view.component.html',
  styleUrls: ['./thread-posts-view.component.scss']
})
export class ThreadPostsViewComponent implements OnInit {
  userResponse: UserResponse = this.sessionStorageService.getUserFromSession();
  paginatedPostsResponse: PaginatedPostsResponse;
  currentPost: PostResponse;
  searchControl: FormControl = new FormControl();
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
    totalPagesArray: number[] = [];
    threadID: string;
  constructor(      private route: ActivatedRoute,
                    private postService: PostService,
                    private toastr: ToastrService,
                    private sessionStorageService: SessionStorageService,
                    private modalService: NgbModal,
                    private router: Router
  ) {
  }
  set currentPage(value: number) {
    this._currentPage = value;
    if (this.searchControl.value == null) {
      this.loadPosts(this._currentPage, this.itemsPerPage, null);
    } else {
      this.loadPosts(this._currentPage, this.itemsPerPage, this.searchControl.value);
    }
  }
  get currentPage(): number {
    return this._currentPage;
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.threadID = params['threadID'];
    });
    this.loadPosts(this.currentPage, this.itemsPerPage, null);
      this.searchControl.valueChanges
          .pipe(debounceTime(200))
          .subscribe(value => {
              this.loadPosts(1, this.itemsPerPage, value);
          });
  }
    loadPosts(page: number, size: number, keyword?: string) {
        this.postService.getPostsByThread(this.threadID, page - 1, keyword, size).subscribe((paginatedPostsResponse) => {
            this.paginatedPostsResponse = paginatedPostsResponse;
            this.paginatedPostsResponse.posts.forEach(post => {
                post.createdDate = new Date(post.createdDate);
                post.smallTitle = post.title;
                post.smallContent = post.content;
                if (post.title.length > 90) {
                    post.smallTitle = post.title.substring(0, 87) + '...';
                }
                if (post.content.length > 200) {
                    post.smallContent = post.content.substring(0, 197) + '...';
                }
            });
            this.totalPages = this.paginatedPostsResponse.totalPages;
            this.totalPagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
            console.log(this.paginatedPostsResponse);
        }, error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('An error occurred. Please try again.');
            }
        });
    }
    goBackToThreadList() {
        this.router.navigate([`/forum/${this.userResponse?.education?.institutionID}`]); // Adjust the route as needed
    }
    modalConfirmClassFunction(content: any, post: PostResponse) {
    this.currentPost = post;
    this.modalService.open(content, { ariaLabelledBy: 'confirm class' , backdrop: false })
        .result.then((result) => {
      if (result === 'Ok') {
        this.deletePost(post);
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
  deletePost(post: PostResponse) {
  this.postService.deletePost(post.id).subscribe(() => {
        this.paginatedPostsResponse.posts = this.paginatedPostsResponse.posts.filter(p => p.id !== post.id);
        this.toastr.success('Post deleted successfully');
        this.currentPost = null;
        }, error => {
        if (error.error) {
            this.toastr.error(error.error);
        } else {
            this.toastr.error('An error occurred. Please try again.');
        }
  });
  }

  editPost(post: PostResponse) {
      const modalRef = this.modalService.open(UpdatePostComponent,
          { size : 'lg', backdrop: false });
      modalRef.componentInstance.post = post;
      modalRef.componentInstance.postUpdated.subscribe(() => {
          this.loadPosts(this.currentPage, this.itemsPerPage, null);
          modalRef.close();
      });
  }

  addPost(threadID: string) {
      const modalRef = this.modalService.open(CreatePostComponent,
          { size : 'lg', backdrop: false });
      modalRef.componentInstance.threadID = threadID;
      modalRef.componentInstance.postAdded.subscribe(() => {
          this.loadPosts(this.currentPage, this.itemsPerPage, null);
          modalRef.close();
      });
  }
    changePage(page: number) {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.currentPage = page;
    }
}
