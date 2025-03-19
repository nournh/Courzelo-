import {Component, OnInit} from '@angular/core';
import {PostResponse} from '../../../shared/models/Forum/PostResponse';
import {CommentResponse} from '../../../shared/models/Forum/CommentResponse';
import {SessionStorageService} from '../../../shared/services/user/session-storage.service';
import {PostService} from '../../../shared/services/Forum/post.service';
import {CommentService} from '../../../shared/services/Forum/comment.service';
import {ActivatedRoute, Router} from '@angular/router';
import {PaginatedCommentsResponse} from '../../../shared/models/Forum/PaginatedCommentsResponse';
import {CreateCommentRequest} from '../../../shared/models/Forum/CreateCommentRequest';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-thread-post-view',
  templateUrl: './thread-post-view.component.html',
  styleUrls: ['./thread-post-view.component.scss']
})
export class ThreadPostViewComponent implements OnInit {
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  totalPagesArray: number[] = [];
  post: PostResponse;
  paginatedCommentsResponse: PaginatedCommentsResponse;
  newCommentContent = '';
  addCommentForm: FormGroup;
  editingComment: CommentResponse = null;
  userResponse = this.sessionStorageService.getUserFromSession();
  set currentPage(value: number) {
    this._currentPage = value;
      this.loadComments(this.post.id, this._currentPage, this.itemsPerPage);
  }
  get currentPage(): number {
    return this._currentPage;
  }
  constructor(
      private route: ActivatedRoute,
      private postService: PostService,
      private commentService: CommentService,
      private sessionStorageService: SessionStorageService,
      private modalService: NgbModal,
      private toastr: ToastrService,
        private router: Router,
      private fb: FormBuilder
  ) {
    this.addCommentForm = this.fb.group({
      newCommentContent: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.params['postID'];
    this.loadPost(postId);
    this.loadComments(postId, this.currentPage, this.itemsPerPage);
  }
  goBack(): void {
    this.router.navigate([`/forum/${this.post.threadID}/posts`]); // adjust the route as needed
  }
  loadPost(postId: string): void {
    this.postService.getPost(postId).subscribe(post => {
      this.post = post;
    });
  }

  loadComments(postId: string, page: number, size: number): void {
    this.commentService.getCommentsByPost(postId, page - 1, size).subscribe(comments => {
      comments.comments.forEach(comment => {
        comment.content = comment.content.split('').join('\u200B');
      });
      console.log(comments);
      this.paginatedCommentsResponse = comments;
      this.totalPages = this.paginatedCommentsResponse.totalPages;
      this.totalPagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    }, error => {
      if (error.error) {
        this.toastr.error(error.error);
      } else {
        this.toastr.error('Error loading comments');
      }
    });
  }
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }
  addComment(): void {
    if (this.addCommentForm.valid) {
      const newComment: CreateCommentRequest = {
        content: this.addCommentForm.get('newCommentContent').value,
      };
      this.commentService.createComment(this.post.id, newComment).subscribe((comment) => {
        this.addCommentForm.reset();
        this.toastr.success('Comment added successfully');
        this.loadComments(this.post.id, this.currentPage, this.itemsPerPage);
      }, error => {
        if (error.error) {
          this.toastr.error(error.error);
        } else {
          this.toastr.error('Error adding comment');
        }
      });
    }
  }

  editComment(comment: CommentResponse): void {
    this.editingComment = { ...comment };
  }

  updateComment(comment: CommentResponse): void {
    const updatedComment: CreateCommentRequest = {
        content: this.editingComment.content,
    };
    this.commentService.updateComment(comment.id, updatedComment).subscribe(() => {
      const index = this.paginatedCommentsResponse.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        this.paginatedCommentsResponse.comments[index] = { ...this.editingComment };
      }
      this.editingComment = null;
    });
  }

  cancelEditComment(): void {
    this.editingComment = null;
  }


  deleteComment(comment: CommentResponse): void {
    this.commentService.deleteComment(comment.id).subscribe(() => {
      this.paginatedCommentsResponse.comments = this.paginatedCommentsResponse.comments.filter(c => c.id !== comment.id);
      this.paginatedCommentsResponse.totalComments--;
      this.editingComment = null;
    });
  }
  modalConfirmCommentFunction(content: any, comment: CommentResponse) {
    this.modalService.open(content, { ariaLabelledBy: 'confirm class' , backdrop: false })
        .result.then((result) => {
      if (result === 'Ok') {
        this.deleteComment(comment);
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
}
