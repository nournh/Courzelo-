import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ResponseHandlerService} from '../../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';
import {CourseService} from '../../../../shared/services/institution/course.service';
import {CourseRequest} from '../../../../shared/models/institution/CourseRequest';
import {InstitutionResponse} from '../../../../shared/models/institution/InstitutionResponse';

@Component({
  selector: 'app-add-module',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent {
  @Output() courseAdded = new EventEmitter<void>();
  @Input() moduleID: string;
  @Input() institution: InstitutionResponse;
  addCourseForm: FormGroup;
  courseRequest: CourseRequest;
  currentInstitution: InstitutionResponse;

  constructor(
      private fb: FormBuilder,
      private courseService: CourseService,
      private handleResponse: ResponseHandlerService,
      private toastr: ToastrService
  ) {
    this.addCourseForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      skills: [[]],
      duration: ['', Validators.required],
      credit: [0, Validators.required],
      scoreToPass: [0, Validators.required],
      semester: [null],
      moduleParts: this.fb.array([])

    });
  }
  get courseParts(): FormArray {
    return this.addCourseForm.get('moduleParts') as FormArray;
  }

  addCoursePart(): void {
    this.courseParts.push(this.fb.group({
      name: ['', Validators.required],
      value: [0, Validators.required]
    }));
  }

  removeCoursePart(index: number): void {
    this.courseParts.removeAt(index);
  }
  onSubmit() {
    if (this.addCourseForm.valid) {
      console.log(this.addCourseForm.value);
      const formValue = this.addCourseForm.value;
      const modulePartsMap = {};

      formValue.moduleParts.forEach(part => {
        modulePartsMap[part.name] = part.value;
      });

      this.courseRequest = {
        ...formValue,
        courseParts: modulePartsMap,
        moduleID: this.moduleID
      };
        console.log(this.courseRequest);
      this.courseService.createCourse(this.courseRequest).subscribe(
          () => {
            this.toastr.success('Course added successfully');
            this.courseAdded.emit();
          },
          error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Failed to add course');
            }
          }
      );
    }
  }
}
