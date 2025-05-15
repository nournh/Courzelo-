import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InstitutionResponse } from '../../../shared/models/institution/InstitutionResponse';
import { InstitutionService } from '../../../shared/services/institution/institution.service';
import { ResponseHandlerService } from '../../../shared/services/user/response-handler.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgramResponse } from '../../../shared/models/institution/ProgramResponse';
import { PaginatedProgramsResponse } from '../../../shared/models/institution/PaginatedProgramsResponse';
import { ProgramService } from '../../../shared/services/institution/program.service';
import { debounceTime } from 'rxjs/operators';
import { ClassroomService } from '../../../shared/services/institution/classroom.service';
import { AuthenticationService } from 'src/app/shared/services/user/authentication.service';

@Component({
  selector: 'app-teacher-programs',
  templateUrl: './teacher-programs.component.html',
  styleUrls: ['./teacher-programs.component.scss']
})
export class TeacherProgramsComponent implements OnInit {
  loadingPrograms = false;
  institutionID: string;
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  searchControl: FormControl = new FormControl();
  currentInstitution: InstitutionResponse;
  currentProgram: ProgramResponse;
  paginatedPrograms: PaginatedProgramsResponse;
  selectedSemester: string;

  constructor(
    private authService: AuthenticationService,
    private institutionService: InstitutionService,
    private programService: ProgramService,
    private courseService: ClassroomService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.institutionID = this.route.snapshot.paramMap.get('institutionID');

    this.institutionService.getInstitutionByID(this.institutionID).subscribe(response => {
      this.currentInstitution = response;
    });

    this.getPrograms(this.currentPage, this.itemsPerPage, null);

    this.searchControl.valueChanges
      .pipe(debounceTime(200))
      .subscribe(value => {
        this.getPrograms(1, this.itemsPerPage, value);
      });
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
    const keyword = this.searchControl.value;
    this.getPrograms(this._currentPage, this.itemsPerPage, keyword);
  }

  createCourses(semester: string): void {
    if (semester === 'BOTH') {
      semester = '';
    }

    this.courseService.addProgramClassrooms(this.institutionID, semester, this.currentProgram.id).subscribe(
      response => {
        this.toastr.success('Courses created successfully');
      },
      error => {
        this.toastr.error(error.error || 'An error occurred', 'Error');
      }
    );
  }

  getPrograms(page: number, sizePerPage: number, keyword?: string): void {
    this.loadingPrograms = true;
    this.programService.getProgramsForTeacher(page - 1, sizePerPage, this.institutionID, keyword).subscribe(
      response => {
        this.paginatedPrograms = response;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.loadingPrograms = false;
      },
      error => {
        this.toastr.error(error.error || 'An error occurred', 'Error');
        this.loadingPrograms = false;
      }
    );
  }

  deleteProgram(id: string): void {
    this.loadingPrograms = true;
    this.programService.deleteProgram(id).subscribe(
      response => {
        this.toastr.success('Program deleted successfully');
        this.paginatedPrograms.programs = this.paginatedPrograms.programs.filter(p => p.id !== id);
        this.loadingPrograms = false;
      },
      error => {
        this.toastr.error(error.error || 'An error occurred', 'Error');
        this.loadingPrograms = false;
      }
    );
  }

  modalConfirmFunction(content: any, program: ProgramResponse) {
    this.currentProgram = program;
    this.modalService.open(content, { ariaLabelledBy: 'confirm Program', backdrop: false })
      .result.then((result) => {
        if (result === 'Ok') {
          this.deleteProgram(this.currentProgram.id);
          this.currentProgram = null;
        }
      }, (reason) => {
        console.log('Err!', reason);
      });
  }

  modalCreateCoursesFunction(content: any, program: ProgramResponse) {
    this.currentProgram = program;
    this.modalService.open(content, { ariaLabelledBy: 'confirm Program', backdrop: false })
      .result.then((result) => {
        if (result === 'Ok') {
          this.currentProgram = null;
        }
      }, (reason) => {
        console.log('Err!', reason);
      });
  }

  viewCourses(program: ProgramResponse): void {
    this.router.navigate(['/institution', this.currentInstitution.id, 'programs', program.id, 'courses'], {
      state: { program }
    });
  }

  viewModules(program: ProgramResponse): void {
    this.router.navigate(['/institution', this.currentInstitution.id, 'programs', program.id, 'modules'], {
      state: { program }
    });
  }
}