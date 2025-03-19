import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ForumService} from '../../../../shared/services/Forum/forum.service';
import {CreateThreadRequest} from '../../../../shared/models/Forum/CreateThreadRequest';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-create-thread',
  templateUrl: './create-thread.component.html',
  styleUrls: ['./create-thread.component.scss']
})
export class CreateThreadComponent {
  @Input() institutionID: string;
  @Output() threadAdded = new EventEmitter<void>();
  addThreadForm: FormGroup;

  constructor(private fb: FormBuilder, private forumService: ForumService, private toastr: ToastrService) {
    this.addThreadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.addThreadForm.valid) {
      const threadRequest: CreateThreadRequest = {
        name: this.addThreadForm.value.name,
        description: this.addThreadForm.value.description,
        institutionID: this.institutionID
      };
        this.forumService.addThread(threadRequest).subscribe(() => {
          this.toastr.success('Thread added successfully');
            this.threadAdded.emit();
            this.addThreadForm.reset();
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
