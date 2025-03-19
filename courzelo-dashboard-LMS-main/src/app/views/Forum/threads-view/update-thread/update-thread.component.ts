import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CreateThreadRequest} from "../../../../shared/models/Forum/CreateThreadRequest";
import {ThreadResponse} from "../../../../shared/models/Forum/ThreadResponse";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ForumService} from "../../../../shared/services/Forum/forum.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-update-thread',
  templateUrl: './update-thread.component.html',
  styleUrls: ['./update-thread.component.scss']
})
export class UpdateThreadComponent implements OnInit {
  @Input() thread: ThreadResponse;
  @Output() threadUpdated = new EventEmitter<void>();
  updateThreadForm: FormGroup;

  constructor(private fb: FormBuilder, private forumService: ForumService, private toastr: ToastrService) {
    this.updateThreadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.thread) {
      this.updateThreadForm.patchValue({
        name: this.thread.name,
        description: this.thread.description
      });
    }
  }

  onSubmit() {
    if (this.updateThreadForm.valid) {
      const threadRequest: CreateThreadRequest = {
        name: this.updateThreadForm.value.name,
        description: this.updateThreadForm.value.description
      };
      this.forumService.updateThread(this.thread.id, threadRequest).subscribe(() => {
        this.toastr.success('Thread updated successfully');
        this.threadUpdated.emit();
        this.updateThreadForm.reset();
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
