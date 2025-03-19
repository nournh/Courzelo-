import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProgramResponse} from '../../../../shared/models/institution/ProgramResponse';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProgramService} from '../../../../shared/services/institution/program.service';
import {ResponseHandlerService} from '../../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-edit-program',
  templateUrl: './edit-program.component.html',
  styleUrls: ['./edit-program.component.scss']
})
export class EditProgramComponent implements OnInit {
  @Input() program: ProgramResponse;
  @Output() programUpdated = new EventEmitter<void>();
  creditSum: number;
  editProgramForm: FormGroup;

  constructor(
      private fb: FormBuilder,
      private programService: ProgramService,
      private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getProgramModulesCreditsSum();
    this.editProgramForm = this.fb.group({
      name: [this.program.name, Validators.required],
      description: [this.program.description, Validators.required],
      credits: [this.program.credits, Validators.required],
      duration: [this.program.duration]
    });
  }
  getProgramModulesCreditsSum() {
    this.programService.getProgramModuleCreditsSum(this.program.id).subscribe(
        response => {
            this.creditSum = response;
        }
    );
  }
  onSubmit() {
    if (this.editProgramForm.valid) {
      this.programService.updateProgram(this.program.id, this.editProgramForm.value).subscribe(
          () => {
            this.toastr.success('Program updated successfully');
            this.programUpdated.emit({ ...this.program, ...this.editProgramForm.value });
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
