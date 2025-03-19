import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseResponse} from "../../../../shared/models/institution/CourseResponse";
import {InstitutionResponse} from "../../../../shared/models/institution/InstitutionResponse";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ModuleResponse} from "../../../../shared/models/institution/ModuleResponse";
import {ModuleRequest} from "../../../../shared/models/institution/ModuleRequest";
import {ModuleService} from "../../../../shared/services/institution/module.service";

@Component({
  selector: 'app-edit-module',
  templateUrl: './edit-module.component.html',
  styleUrls: ['./edit-module.component.scss']
})
export class EditModuleComponent implements OnInit{
  @Input() module: ModuleResponse;
  @Input() institution: InstitutionResponse;
  @Output() moduleUpdated = new EventEmitter<void>();
  editModuleForm: FormGroup;
  moduleRequest: ModuleRequest;

  constructor(
      private fb: FormBuilder,
      private moduleService: ModuleService,
      private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    this.editModuleForm = this.fb.group({
      name: [this.module.name, Validators.required],
      description: [this.module.description, Validators.required]
    });
  }
  onSubmit() {
    if (this.editModuleForm.valid) {
      console.log(this.editModuleForm.value);
      this.moduleRequest = this.editModuleForm.value;

      console.log(this.moduleRequest);
      this.moduleService.updateModule(this.module.id, this.moduleRequest).subscribe(
          () => {
            this.toastr.success('Course module successfully');
            this.moduleUpdated.emit({ ...this.module, ...this.editModuleForm.value });
          },
          error => {
            if (error.error) {
              this.toastr.error(error.error);
            } else {
              this.toastr.error('Failed to update module');
            }

          }
      );
    }
  }
}