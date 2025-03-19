import {Component, OnInit, ViewChild} from '@angular/core';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {ResponseHandlerService} from '../../../shared/services/user/response-handler.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GroupResponse} from '../../../shared/models/institution/GroupResponse';
import {GroupService} from '../../../shared/services/institution/group.service';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import {AddClassComponent} from './add-class/add-class.component';
import {EditClassComponent} from './edit-class/edit-class.component';
import {debounceTime} from 'rxjs/operators';
import {ProgramService} from '../../../shared/services/institution/program.service';
import {ViewCoursesComponent} from './view-courses/view-courses.component';
import {ViewStudentsComponent} from '../../../shared/components/view-students/view-students.component';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit {
  set currentPageClasses(value: number) {
    this._currentPageClasses = value;
      if (this.searchControl.value == null) {
          this.loadGroups(this._currentPageClasses, this.itemsPerPageClasses, null);
      } else {
          this.loadGroups(this._currentPageClasses, this.itemsPerPageClasses, this.searchControl.value);
      }
  }
  get currentPageClasses(): number {
    return this._currentPageClasses;
  }
  currentClass: GroupResponse;
  classes: GroupResponse[] = [];
  _currentPageClasses = 1;
  totalPagesClasses = 0;
  totalItemsClasses = 0;
  itemsPerPageClasses = 10;
  createClassForm = this.formBuilder.group({
    name: ['', Validators.required],
    students: [[], Validators.required]
  });
  constructor(
      private institutionService: InstitutionService,
      private handleResponse: ResponseHandlerService,
      private formBuilder: FormBuilder,
      private toastr: ToastrService,
      private route: ActivatedRoute,
      private modalService: NgbModal,
      private groupService: GroupService,
      private programService: ProgramService,
  ) { }
  institutionID;
    currentInstitution: InstitutionResponse;
    currentGroup: GroupResponse;
    searchControl: FormControl = new FormControl();
    loadingClasses = false;
    students;
    loading = false;
    @ViewChild('listModal') listModal;
    modalTitle: string;
    modalList: string[];
  ngOnInit(): void {
      this.institutionID = this.route.snapshot.paramMap.get('institutionID');
        this.institutionService.getInstitutionByID(this.institutionID).subscribe(
            response => {
                this.currentInstitution = response;
            },
            error => {
                this.handleResponse.handleError(error);
            }
        );
        this.loadGroups(this.currentPageClasses, this.itemsPerPageClasses, null);
    this.institutionService.getInstitutionStudents(this.institutionID).subscribe(
        response => {
          console.log(response);
          this.students = response;
        }, error => {
          this.handleResponse.handleError(error);
        }
    );
      this.searchControl.valueChanges
          .pipe(debounceTime(200))
          .subscribe(value => {
              this.loadGroups(1, this.itemsPerPageClasses, value);
          });
    }
    openViewCoursesModal( group: GroupResponse) {
        const modalRef = this.modalService.open(ViewCoursesComponent,
            { size : 'lg', backdrop: false });
        modalRef.componentInstance.program = group?.program;
        modalRef.componentInstance.group = group;
        modalRef.componentInstance.close.subscribe(() => {
            modalRef.close();
        });
    }
    openViewStudentsModal(group: GroupResponse) {
        const modalRef = this.modalService.open(ViewStudentsComponent, { size : 'lg' , backdrop: false});
        modalRef.componentInstance.group = group;
        modalRef.componentInstance.close.subscribe(() => {
            modalRef.close();
        });
    }
    openAddClassModal() {
        const modalRef = this.modalService.open(AddClassComponent, { backdrop: false});
        modalRef.componentInstance.institutionID = this.institutionID;
        modalRef.componentInstance.classAdded.subscribe(() => {
            this.loadGroups(this.currentPageClasses, this.itemsPerPageClasses);
            modalRef.close();
        });
    }
  loadGroups(page: number, size: number, keyword?: string) {
    this.loadingClasses = true;
    console.log('loading info', page, size, keyword);
    this.groupService.getGroupsByInstitution(this.institutionID, page - 1, keyword, size).subscribe(
        response => {
          console.log(response);
          this.classes = response.groups;
          this.classes.forEach(group => {
              if (group.program != null) {
                  this.loadingClasses = true;
                    this.programService.getSimplifiedProgram(group.program).subscribe(
                        program => {
                            group.simplifiedProgram = program;
                            this.loadingClasses = false;
                        }, error => {
                            if (error.error) {
                                this.toastr.error(error.error);
                            } else {
                                this.toastr.error('An error occurred while loading classes');
                            }
                            this.loadingClasses = false;
                        }
                    );
              }
          });
          this._currentPageClasses = response.currentPage + 1;
          this.totalPagesClasses = response.totalPages;
          this.totalItemsClasses = response.totalItems;
          this.loadingClasses = false;
        }, error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('An error occurred while loading classes');
            }
            this.loadingClasses = false;
        }
    );
  }
  openModal(type: string, list: any[]): void {
        this.modalTitle = type === 'students' ? 'Students' : 'Courses';
        if (type === 'courses') {
            this.modalList = list.map(course => course.courseName);
        } else {
            this.modalList = list;
        }
        this.modalService.open(this.listModal, { size: 'lg' });
    }
  modalConfirmClassFunction(content: any, group: GroupResponse) {
    this.currentClass = group;
    this.modalService.open(content, { ariaLabelledBy: 'confirm class' , backdrop: false })
        .result.then((result) => {
      if (result === 'Ok') {
        this.removeGroup(group);
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
    openEditClassModal(group: GroupResponse) {
        const modalRef = this.modalService.open(EditClassComponent, {backdrop: false});
        modalRef.componentInstance.group = group;
        modalRef.componentInstance.groupUpdated.subscribe((groupUpdated: GroupResponse) => {
                if (groupUpdated != null) {
                    const index = this.classes.findIndex(p => p.id === groupUpdated.id);
                    if (index !== -1) {
                        this.classes[index] = groupUpdated;
                    }
                }
                modalRef.close();
            }, (reason) => {
                console.log('Err!', reason);
                modalRef.close();
            }
        );
    }
  removeGroup(group: GroupResponse) {
    this.loadingClasses = true;
    this.groupService.deleteGroup(group.id).subscribe(
        response => {
          this.toastr.success('Class removed successfully');
          this.loadGroups(this.currentPageClasses, this.itemsPerPageClasses);
          this.loadingClasses = false;
        }, error => {
          this.handleResponse.handleError(error);
          this.loadingClasses = false;
        }
    );
  }
  shouldShowError(controlName: string, errorName: string): boolean {
    const control = this.createClassForm.get(controlName);
    return control && control.errors && control.errors[errorName] && (control.dirty || control.touched);
  }
}
