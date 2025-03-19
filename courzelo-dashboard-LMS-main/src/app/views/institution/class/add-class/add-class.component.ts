import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ResponseHandlerService} from '../../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';
import {GroupService} from '../../../../shared/services/institution/group.service';
import {ProgramService} from '../../../../shared/services/institution/program.service';
import {SimplifiedProgramResponse} from '../../../../shared/models/institution/SimplifiedProgramResponse';
import {GroupRequest} from '../../../../shared/models/institution/GroupRequest';

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.scss']
})
export class AddClassComponent implements OnInit {
  @Output() classAdded = new EventEmitter<void>();
  @Input() institutionID: string;
  addClassForm: FormGroup;
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
    this.addClassForm = this.fb.group({
      name: ['', Validators.required],
      students: [[]],
      program: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.programService.getSimplifiedPrograms(this.institutionID).subscribe(
        programs => {
          console.log(programs);
            this.availablePrograms = programs;
        },
        error => {
          this.handleResponse.handleError(error);
        }
    );
    }
  emailValidator: ValidatorFn = (control: AbstractControl) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { 'invalidEmail': true };
  }
  public onSelect(item) {
    console.log('tag selected: value is ' + item);
    console.log('students emails: ' + this.addClassForm.get('studentsEmails').value);
  }
  onSubmit() {
    if (this.addClassForm.valid) {
      this.groupRequest = this.addClassForm.value;
      this.groupRequest.institutionID = this.institutionID;
      console.log(this.groupRequest);
      this.groupService.createGroup(this.groupRequest).subscribe(
          () => {
            this.toastr.success('Class added successfully');
            this.classAdded.emit();
          },
          error => {
            this.handleResponse.handleError(error);
          }
      );
    }
  }
}
