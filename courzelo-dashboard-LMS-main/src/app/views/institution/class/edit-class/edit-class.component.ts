import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {GroupResponse} from '../../../../shared/models/institution/GroupResponse';
import {ResponseHandlerService} from '../../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';
import {GroupService} from '../../../../shared/services/institution/group.service';
import {SimplifiedProgramResponse} from '../../../../shared/models/institution/SimplifiedProgramResponse';
import {GroupRequest} from '../../../../shared/models/institution/GroupRequest';
import {ProgramService} from '../../../../shared/services/institution/program.service';

@Component({
  selector: 'app-edit-class',
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.scss']
})
export class EditClassComponent implements OnInit {

  @Input() group: GroupResponse;
  @Output() groupUpdated = new EventEmitter<void>();
  editGroupForm: FormGroup;
  availablePrograms: SimplifiedProgramResponse[] = [];
  groupRequest: GroupRequest;
  pasteSplitPattern = /[\s,;]+/;
  constructor(
      private fb: FormBuilder,
      private groupService: GroupService,
      private programService: ProgramService,
      private handleResponse: ResponseHandlerService,
      private toastr: ToastrService
  ) {
  }
  ngOnInit(): void {
    console.log(this.group);
    this.programService.getSimplifiedPrograms(this.group.institutionID).subscribe(
        programs => {
          console.log(programs);
          this.availablePrograms = programs;
        },
        error => {
          this.handleResponse.handleError(error);
        }
    );
    this.editGroupForm = this.fb.group({
      name: [this.group.name, Validators.required],
      students: [this.group.students],
      program: [this.group.program]
    });
  }
  emailValidator: ValidatorFn = (control: AbstractControl) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { 'invalidEmail': true };
  }
  public onSelect(item) {
    console.log('tag selected: value is ' + item);
    console.log('students emails: ' + this.editGroupForm.get('studentsEmails').value);
  }
  onSubmit() {
    if (this.editGroupForm.valid) {
      this.groupService.updateGroup(this.group.id, this.editGroupForm.value).subscribe(
          () => {
            this.toastr.success('Class updated successfully');
            this.groupUpdated.emit({ ...this.group, ...this.editGroupForm.value });
          },
          error => {
            this.handleResponse.handleError(error);
          }
      );
    }
  }
}
