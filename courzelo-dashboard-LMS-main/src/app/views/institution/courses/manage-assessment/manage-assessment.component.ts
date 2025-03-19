import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseResponse} from '../../../../shared/models/institution/CourseResponse';
import {AssessmentRequest} from '../../../../shared/models/institution/AssessmentRequest';
import {ToastrService} from 'ngx-toastr';
import {CourseService} from '../../../../shared/services/institution/course.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-manage-assessment',
  templateUrl: './manage-assessment.component.html',
  styleUrls: ['./manage-assessment.component.scss']
})
export class ManageAssessmentComponent implements OnInit {
  loading = false;
  isEditMode = false;
  isAddMode = false;
  @Input() courseResponse: CourseResponse;
  @Output() close = new EventEmitter<void>();
  currentAssessment: AssessmentRequest;
  constructor(
      private toastr: ToastrService,
      private moduleService: CourseService,
      private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    if (this.courseResponse.assessments != null && this.courseResponse.assessments.length > 0) {
        this.courseResponse.assessments = this.courseResponse.assessments.map(assessment => {
            return {
            ...assessment,
            weight: assessment.weight * 100
            };
        });
    }
  }
  onClose(): void {
    if (this.courseResponse.assessments != null && this.courseResponse.assessments.length > 0) {
        this.courseResponse.assessments = this.courseResponse.assessments.map(assessment => {
            return {
            ...assessment,
            weight: assessment.weight / 100
            };
        });
    }
    this.close.emit();
  }
  calculateAssessmentWeight(): number {
    let total = 0;
    if (this.courseResponse.assessments) {
        this.courseResponse.assessments.forEach(assessment => {
            total += assessment.weight;
        });
    }
    return total;
  }
  addNewAssessment(): void {
    this.isAddMode = true;
    this.currentAssessment = {oldName: '', name: '', weight: null };
  }

  editAssessment(assessment: any): void {
    this.isEditMode = true;
    this.currentAssessment = { ...assessment };
    this.currentAssessment.oldName = assessment.name;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.isAddMode = false;
    this.currentAssessment = {oldName: '', name: '', weight: null };
  }
    modalConfirmFunction(content: any, assessment: AssessmentRequest) {
        this.currentAssessment = assessment;
        this.modalService.open(content, { ariaLabelledBy: 'confirm Module', backdrop: false })
            .result.then((result) => {
            if (result === 'Ok') {
                this.deleteAssessment(assessment.name);
                this.currentAssessment = {oldName: '', name: '', weight: null };
            }
        }, (reason) => {
            console.log('Err!', reason);
        });
    }
  onSubmitAssessment(): void {
    if (this.isEditMode) {
      console.log('Edit mode');
      // Update existing assessment
      const index = this.courseResponse.assessments.findIndex(a => a.name === this.currentAssessment.oldName);
      if (index > -1) {
        if (this.currentAssessment.name === this.currentAssessment.oldName ||
            this.courseResponse.assessments.findIndex(a => a.name === this.currentAssessment.name) === -1) {
          {
            const assessmentCopy = {...this.currentAssessment};
            this.moduleService.updateAssessment(this.courseResponse.id, this.currentAssessment).subscribe(
                response => {
                  this.courseResponse.assessments[index] = {...assessmentCopy};
                  this.toastr.success('Assessment updated successfully');
                },
                error => {
                  if (error.error) {
                    this.toastr.error(error.error);
                  } else {
                    this.toastr.error('Failed to update assessment');
                  }
                }
            );
          }
        } else {
            this.toastr.error('Assessment with the same name already exists');
        }
      }
    } else if (this.isAddMode) {
      console.log(this.courseResponse);
      if (!this.courseResponse.assessments) {
        this.courseResponse.assessments = [];
      }
      if (this.courseResponse.assessments.findIndex(a => a.name === this.currentAssessment.name) > -1) {
        this.toastr.error('Assessment with the same name already exists');
      } else {
        console.log(this.currentAssessment);
        const assessmentCopy = { ...this.currentAssessment }; // Create a copy
        this.moduleService.createAssessment(this.courseResponse.id, assessmentCopy).subscribe(
            response => {
              console.log(assessmentCopy);
              this.courseResponse.assessments.push(assessmentCopy);
              this.toastr.success('Assessment created successfully');
              console.log(this.courseResponse);
            },
            error => {
              if (error.error) {
                this.toastr.error(error.error);
              } else {
                this.toastr.error('Failed to create assessment');
              }
            }
        );
      }
    }

    // Reset the form and exit add/edit mode
    this.cancelEdit();
  }

  deleteAssessment(name: string): void {
    this.moduleService.deleteAssessment(this.courseResponse.id, name).subscribe(
        response => {
          this.courseResponse.assessments = this.courseResponse.assessments.filter(a => a.name !== name);
          this.toastr.success('Assessment deleted successfully');
        },
        error => {
          if (error.error) {
            this.toastr.error(error.error);
          } else {
            this.toastr.error('Failed to delete assessment');
          }
        }
    );
  }
}
