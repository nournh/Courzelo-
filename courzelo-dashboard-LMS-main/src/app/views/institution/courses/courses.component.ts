import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ProgramResponse} from '../../../shared/models/institution/ProgramResponse';
import {ResponseHandlerService} from '../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime} from 'rxjs/operators';
import {CourseResponse} from '../../../shared/models/institution/CourseResponse';
import {PaginatedCoursesResponse} from '../../../shared/models/institution/PaginatedCoursesResponse';
import {CourseService} from '../../../shared/services/institution/course.service';
import {AddCourseComponent} from './add-course/add-course.component';
import {EditCourseComponent} from './edit-course/edit-course.component';
import {ActivatedRoute} from '@angular/router';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {ManageAssessmentComponent} from './manage-assessment/manage-assessment.component';
import {ViewCoursePartsComponent} from './view-course-parts/view-course-parts.component';
import {ModuleResponse} from "../../../shared/models/institution/ModuleResponse";

@Component({
  selector: 'app-modules',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  loadingModules = false;
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  searchControl: FormControl = new FormControl();
  @Input() moduleResponse: ModuleResponse;
  currentCourse: CourseResponse;
  paginatedCourses: PaginatedCoursesResponse;
  currentInstitution: InstitutionResponse;
  constructor(
      private courseService: CourseService,
      private institutionService: InstitutionService,
      private handleResponse: ResponseHandlerService,
      private toastr: ToastrService,
      private modalService: NgbModal,
        private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.moduleResponse = history.state.module;
      this.getCourses(this.currentPage, this.itemsPerPage, this.moduleResponse.id, "");
      this.getInstitution(this.moduleResponse.institutionID);
    });
    this.searchControl.valueChanges
        .pipe(debounceTime(200))
        .subscribe(value => {
          this.getCourses(1, this.itemsPerPage, this.moduleResponse.id, value);
        });
  }
  get currentPage(): number {
    return this._currentPage;
  }
  set currentPage(value: number) {
    this._currentPage = value;
    if (this.searchControl.value == null) {
      this.getCourses(this._currentPage, this.itemsPerPage, this.moduleResponse.id, "");
    } else {
      this.getCourses(this._currentPage, this.itemsPerPage, this.moduleResponse.id, this.searchControl.value);
    }
  }
  getCourses(page: number, sizePerPage: number, moduleID: string, keyword?: string): void {
    this.loadingModules = true;
    this.courseService.getCourses(page - 1, sizePerPage, moduleID, keyword).subscribe(
        response => {
          this.paginatedCourses = response;
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;
          console.log(response);
          this.loadingModules = false;
        },
        error => {
          this.handleResponse.handleError(error);
          this.loadingModules = false;
        }
    );
  }
  getInstitution(institutionID: string): void {
    this.institutionService.getInstitutionByID(institutionID).subscribe(
        response => {
          this.currentInstitution = response;
        }
    );
  }
  deleteCourse(id: string): void {
    this.loadingModules = true;
    this.courseService.deleteCourse(id).subscribe(
        response => {
          this.toastr.success('Course deleted successfully');
          this.paginatedCourses.courses = this.paginatedCourses.courses.filter(p => p.id !== id);
          this.loadingModules = false;
        },
        error => {
          this.handleResponse.handleError(error);
          this.loadingModules = false;
        }
    );
  }
  openAddCourseModal() {
    const modalRef = this.modalService.open(AddCourseComponent, {backdrop: false});
    modalRef.componentInstance.moduleID = this.moduleResponse.id;
    modalRef.componentInstance.institution = this.currentInstitution;
    modalRef.componentInstance.courseAdded.subscribe(() => {
      this.getCourses(this.currentPage, this.itemsPerPage, this.moduleResponse.id, "");
      modalRef.close();
    });
  }
  openViewCoursePartsModal(course: CourseResponse) {
    const modalRef = this.modalService.open(ViewCoursePartsComponent, {backdrop: false});
    modalRef.componentInstance.courseResponse = course;
    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
    });
  }
  openManageAssessmentModal(course: CourseResponse) {
    const modalRef = this.modalService.open(ManageAssessmentComponent, {size : 'lg', backdrop: false});
    modalRef.componentInstance.courseResponse = course;
 //   modalRef.componentInstance.institutionID = this.institutionID;
 /*   modalRef.componentInstance.classAdded.subscribe(() => {
      this.loadGroups(this.currentPageClasses, this.itemsPerPageClasses);
      modalRef.close();
    });*/
    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
    });
  }
  openEditCourseModal(course: CourseResponse) {
    const modalRef = this.modalService.open(EditCourseComponent, {backdrop: false});
    modalRef.componentInstance.course = course;
    modalRef.componentInstance.institution = this.currentInstitution;
    modalRef.componentInstance.courseUpdated.subscribe((updatedModule: CourseResponse) => {
          if (updatedModule != null) {
            const index = this.paginatedCourses.courses.findIndex(p => p.id === updatedModule.id);
            if (index !== -1) {
              this.paginatedCourses.courses[index] = updatedModule;
            }
          }
          modalRef.close();
        }, (reason) => {
          console.log('Err!', reason);
          modalRef.close();
        }
    );
  }
  modalConfirmFunction(content: any, module: CourseResponse) {
    this.currentCourse = module;
    this.modalService.open(content, { ariaLabelledBy: 'confirm Course', backdrop: false })
        .result.then((result) => {
      if (result === 'Ok') {
        this.deleteCourse(this.currentCourse.id);
        this.currentCourse = null;
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
}
