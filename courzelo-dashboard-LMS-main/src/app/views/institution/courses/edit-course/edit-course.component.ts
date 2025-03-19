import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ResponseHandlerService} from '../../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';
import {CourseResponse} from '../../../../shared/models/institution/CourseResponse';
import {CourseService} from '../../../../shared/services/institution/course.service';
import {InstitutionResponse} from '../../../../shared/models/institution/InstitutionResponse';
import {CourseRequest} from '../../../../shared/models/institution/CourseRequest';

@Component({
  selector: 'app-edit-module',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {
  @Input() course: CourseResponse;
  @Input() institution: InstitutionResponse;
  @Output() courseUpdated = new EventEmitter<void>();
  editCourseForm: FormGroup;
  courseRequest: CourseRequest;

  constructor(
      private fb: FormBuilder,
      private courseService: CourseService,
      private handleResponse: ResponseHandlerService,
      private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Convert moduleParts object into an array of [key, value] pairs
    const moduleParts = this.course.courseParts
        ? Object.entries(this.course.courseParts) // Converts { "TP": 40, "Cour": 80 } to [["TP", 40], ["Cour", 80]]
        : [];

    this.editCourseForm = this.fb.group({
      name: [this.course.name, Validators.required],
      description: [this.course.description, Validators.required],
      skills: [this.course.skills],
      duration: [this.course.duration, Validators.required],
      credit: [this.course.credit, Validators.required],
      scoreToPass: [this.course.scoreToPass, Validators.required],
      semester: [
        this.course.semester === 'FIRST_SEMESTER'
            ? 'FIRST_SEMESTER'
            : this.course.semester === 'SECOND_SEMESTER'
                ? 'SECOND_SEMESTER'
                : null
      ],
      moduleParts: this.fb.array(
          moduleParts.map(([key, value]) =>
              this.fb.group({
                name: [key, Validators.required],   // "TP" or "Cour"
                value: [value, Validators.required] // 40 or 80
              })
          )
      ),
      isFinished: [this.course.isFinished || false]
    });
  }


  get courseParts(): FormArray {
    return this.editCourseForm.get('moduleParts') as FormArray;
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
    if (this.editCourseForm.valid) {
      console.log(this.editCourseForm.value);
      const formValue = this.editCourseForm.value;
      const modulePartsMap = {};

      formValue.moduleParts.forEach(part => {
        modulePartsMap[part.name] = part.value;
      });

      this.courseRequest = {
        ...formValue,
        courseParts: modulePartsMap,
      };
      console.log(this.courseRequest);
      this.courseService.updateCourse(this.course.id, this.courseRequest).subscribe(
          () => {
            this.toastr.success('Course updated successfully');
            this.courseUpdated.emit({ ...this.course, ...this.editCourseForm.value });
          },
          error => {
              if (error.error) {
                this.toastr.error(error.error);
              } else {
                this.toastr.error('Failed to update course');
              }

          }
      );
    }
  }
}
