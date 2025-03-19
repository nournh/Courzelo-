import {Component, EventEmitter, Input, Output} from '@angular/core';
import {InstitutionResponse} from "../../../../shared/models/institution/InstitutionResponse";
import { FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ModuleService} from "../../../../shared/services/institution/module.service";
import {ModuleRequest} from "../../../../shared/models/institution/ModuleRequest";

@Component({
  selector: 'app-add-module',
  templateUrl: './add-module.component.html',
  styleUrls: ['./add-module.component.scss']
})
export class AddModuleComponent {
  @Output() moduleAdded = new EventEmitter<void>();
  @Input() programID: string;
  @Input() institution: InstitutionResponse;
  addModuleForm: FormGroup;
  moduleRequest: ModuleRequest;
  currentInstitution: InstitutionResponse;

  constructor(
      private fb: FormBuilder,
      private moduleService: ModuleService,
      private toastr: ToastrService
  ) {
    this.addModuleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.addModuleForm.valid) {
      console.log(this.addModuleForm.value);
      this.moduleRequest = this.addModuleForm.value;
      this.moduleRequest.programID = this.programID;
      this.moduleRequest.institutionID = this.institution.id;
      this.moduleService.createModule(this.moduleRequest).subscribe(
          () => {
            this.toastr.success('Module added successfully');
            this.moduleAdded.emit();
          },
          error => {
            if (error.error) {
              this.toastr.error(error.error);
            } else {
              this.toastr.error('Failed to add module');
            }
          }
      );
    }
  }
}
