import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PostService} from '../../../../shared/services/Forum/post.service';
import {PostResponse} from '../../../../shared/models/Forum/PostResponse';
import {CreatePostRequest} from '../../../../shared/models/Forum/CreatePostRequest';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss']
})
export class UpdatePostComponent implements OnInit {
  @Input() post: PostResponse;
  @Output() postUpdated = new EventEmitter<void>();
  updatePostForm: FormGroup;

  constructor(private fb: FormBuilder, private postService: PostService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.updatePostForm = this.fb.group({
      title: [this.post.title, [Validators.required]],
      content: [this.post.content, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.updatePostForm.valid) {
      const updatedPost: CreatePostRequest = {
        title: this.updatePostForm.value.title,
        content: this.updatePostForm.value.content
      };
      this.postService.updatePost(this.post.id, updatedPost).subscribe(() => {
        this.postUpdated.emit();
        this.toastr.success('Post updated successfully');
      }, error => {
        if (error.error) {
            this.toastr.error(error.error);
        } else {
            this.toastr.error('An error occurred. Please try again.');
        }
          }
      );
    }
  }
}
