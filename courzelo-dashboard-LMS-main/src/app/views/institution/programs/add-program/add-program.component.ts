import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProgramService} from '../../../../shared/services/institution/program.service';
import {ResponseHandlerService} from '../../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-add-program',
  templateUrl: './add-program.component.html',
  styleUrls: ['./add-program.component.scss']
})
export class AddProgramComponent {
  @Output() programAdded = new EventEmitter<void>();
  addProgramForm: FormGroup;

  constructor(
      private fb: FormBuilder,
      private programService: ProgramService,
      private handleResponse: ResponseHandlerService,
      private toastr: ToastrService
  ) {
    this.addProgramForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      credits: [0, Validators.required],
      duration: ['']
    });
  }

  onSubmit() {
    if (this.addProgramForm.valid) {
      this.programService.createProgram(this.addProgramForm.value).subscribe(
          () => {
            this.toastr.success('Program added successfully');
            this.programAdded.emit();
          },
          error => {
            if (error.error) {
              this.toastr.error(error.error, 'Error');
            } else {
              this.toastr.error('An error occurred', 'Error');
            }
          }
      );
    }
  }
}
