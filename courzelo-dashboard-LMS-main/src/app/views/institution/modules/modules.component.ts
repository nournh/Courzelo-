import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {ProgramResponse} from "../../../shared/models/institution/ProgramResponse";
import {CourseResponse} from "../../../shared/models/institution/CourseResponse";
import {InstitutionResponse} from "../../../shared/models/institution/InstitutionResponse";
import {InstitutionService} from "../../../shared/services/institution/institution.service";
import {ToastrService} from "ngx-toastr";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime} from "rxjs/operators";
import {ModuleResponse} from "../../../shared/models/institution/ModuleResponse";
import {PaginatedModuleResponse} from "../../../shared/models/institution/PaginatedModuleResponse";
import {ModuleService} from "../../../shared/services/institution/module.service";
import {AddModuleComponent} from "./add-module/add-module.component";
import {EditModuleComponent} from "./edit-module/edit-module.component";
import {ProgramService} from "../../../shared/services/institution/program.service";

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit{
  loadingModules = false;
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  searchControl: FormControl = new FormControl();
  @Input() currentProgram: ProgramResponse;
  currentModule: ModuleResponse;
  paginatedModules: PaginatedModuleResponse;
  currentInstitution: InstitutionResponse;

  constructor(
      private moduleService: ModuleService,
      private institutionService: InstitutionService,
      private programService: ProgramService,
      private router: Router,
      private toastr: ToastrService,
      private modalService: NgbModal,
      private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentProgram = history.state.program;
      if (!this.currentProgram) {
        const programID = params.get('programID');
        if (programID) {
          this.programService.getProgram(programID).subscribe(
              (fetchedProgram: ProgramResponse) => {
                this.currentProgram = fetchedProgram;
                this.getModules(this.currentPage, this.itemsPerPage, this.currentProgram.id, "");
                this.getInstitution(this.currentProgram.institutionID);
              },
              error => {
                this.toastr.error('Failed to fetch program details');
              }
          );
        } else {
          this.toastr.error('Program ID is missing');
        }
      } else {
        this.getModules(this.currentPage, this.itemsPerPage, this.currentProgram.id, "");
        this.getInstitution(this.currentProgram.institutionID);
      }
    });
    this.searchControl.valueChanges
        .pipe(debounceTime(200))
        .subscribe(value => {
          this.getModules(1, this.itemsPerPage, this.currentProgram.id, value);
        });
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
    if (this.searchControl.value == null) {
      this.getModules(this._currentPage, this.itemsPerPage, this.currentProgram.id, null);
    } else {
      this.getModules(this._currentPage, this.itemsPerPage, this.currentProgram.id, this.searchControl.value);
    }
  }

  getModules(page: number, sizePerPage: number, programID: string, keyword?: string): void {
    this.loadingModules = true;
    this.moduleService.getAllModules(programID,page - 1, sizePerPage,  keyword).subscribe(
        response => {
          this.paginatedModules = response;
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;
          console.log(response);
          this.loadingModules = false;
        },
        error => {
          if(error.error)
          {
            this.toastr.error(error.error);
          }else{
            this.toastr.error('An error occurred. Please try again later');
          }
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

  deleteModule(id: string): void {
    this.loadingModules = true;
    this.moduleService.deleteModule(id).subscribe(
        response => {
          this.toastr.success('Module deleted successfully');
          this.paginatedModules.modules = this.paginatedModules.modules.filter(p => p.id !== id);
          this.loadingModules = false;
        },
        error => {
          if(error.error)
          {
            this.toastr.error(error.error);
          }else{
            this.toastr.error('An error occurred. Please try again later');
          }
          this.loadingModules = false;
        }
    );
  }
  viewCourses(module: ModuleResponse): void {
    this.router.navigate(['/institution', this.currentInstitution.id, 'module', module.id, 'courses'], {
      state: { module }
    });
  }
  openAddModuleModal() {
    const modalRef = this.modalService.open(AddModuleComponent, {backdrop: false});
    modalRef.componentInstance.programID = this.currentProgram.id;
    modalRef.componentInstance.institution = this.currentInstitution;
    modalRef.componentInstance.moduleAdded.subscribe(() => {
      this.getModules(this.currentPage, this.itemsPerPage, this.currentProgram.id, "");
      modalRef.close();
    });
  }

  openEditModuleModal(module: CourseResponse) {
    const modalRef = this.modalService.open(EditModuleComponent, {backdrop: false});
    modalRef.componentInstance.module = module;
    modalRef.componentInstance.institution = this.currentInstitution;
    modalRef.componentInstance.moduleUpdated.subscribe((updatedModule: ModuleResponse) => {
          if (updatedModule != null) {
            const index = this.paginatedModules.modules.findIndex(p => p.id === updatedModule.id);
            if (index !== -1) {
              this.paginatedModules.modules[index] = updatedModule;
            }
          }
          modalRef.close();
        }, (reason) => {
          console.log('Err!', reason);
          modalRef.close();
        }
    );
  }

  modalConfirmFunction(content: any, module: ModuleResponse) {
    this.currentModule = module;
    this.modalService.open(content, {ariaLabelledBy: 'confirm Module', backdrop: false})
        .result.then((result) => {
      if (result === 'Ok') {
        this.deleteModule(this.currentModule.id);
        this.currentModule = null;
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
}
