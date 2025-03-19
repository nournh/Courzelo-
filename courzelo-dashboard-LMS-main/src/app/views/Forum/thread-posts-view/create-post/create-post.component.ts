import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {PostService} from '../../../../shared/services/Forum/post.service';
import {CreatePostRequest} from '../../../../shared/models/Forum/CreatePostRequest';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent {
@Input() threadID: string;
@Output() postAdded = new EventEmitter<void>();
addPostForm: FormGroup;
constructor(
    private fb: FormBuilder, private postService: PostService, private toastr: ToastrService
) {
    this.addPostForm = this.fb.group({
        title: ['', Validators.required],
        content: ['', Validators.required]
    });
}

  onSubmit() {
    if (this.addPostForm.valid) {
        const postRequest: CreatePostRequest = {
            title: this.addPostForm.value.title,
            content: this.addPostForm.value.content,
            threadID: this.threadID
        };
        this.postService.createPost(postRequest).subscribe(() => {
            this.toastr.success('Post added successfully');
            this.postAdded.emit();
            this.addPostForm.reset();
        }, error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('An error occurred. Please try again.');
            }
        });
    }
  }
}
