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
import { AddProgramComponent } from './add-program/add-program.component';
import { debounceTime } from 'rxjs/operators';
import { EditProgramComponent } from './edit-program/edit-program.component';
import { ClassroomService } from '../../../shared/services/institution/classroom.service';
import { GenerateCalendarComponent } from "./generate-calendar/generate-calendar.component";
import { AuthenticationService } from 'src/app/shared/services/user/authentication.service';
import { ProgramStatsModalComponent } from './program-stats-moda/program-stats-moda.component';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss']
})
export class ProgramsComponent implements OnInit {
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
  
  // Variables pour les stats
  statsModalVisible = false;
  currentStats: any = null;
  loadingStats = false;

  constructor(
    private authService: AuthenticationService,
    private institutionService: InstitutionService,
    private programService: ProgramService,
    private courseService: ClassroomService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.institutionID = this.route.snapshot.paramMap.get('institutionID');
    this.institutionService.getInstitutionByID(this.institutionID).subscribe(
      response => {
        this.currentInstitution = response;
      }
    );
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
    if (this.searchControl.value == null) {
      this.getPrograms(this._currentPage, this.itemsPerPage, null);
    } else {
      this.getPrograms(this._currentPage, this.itemsPerPage, this.searchControl.value);
    }
  }

  createCourses(semester: string): void {
    if (semester === 'BOTH') {
      semester = '';
    }
    this.courseService.addProgramClassrooms(this.institutionID, semester, this.currentProgram.id).subscribe(
      response => {
        this.toastr.success('Cours créés avec succès');
      },
      error => {
        if (error.error) {
          this.toastr.error(error.error, 'Erreur');
        } else {
          this.toastr.error('Une erreur est survenue', 'Erreur');
        }
      });
  }

  getPrograms(page: number, sizePerPage: number, keyword?: string): void {
    this.loadingPrograms = true;
    this.programService.getPrograms(page - 1, sizePerPage, this.institutionID, keyword).subscribe(
      response => {
        this.paginatedPrograms = response;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.loadingPrograms = false;
      },
      error => {
        if (error.error) {
          this.toastr.error(error.error, 'Erreur');
        } else {
          this.toastr.error('Une erreur est survenue', 'Erreur');
        }
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
          if (error.error) {
            this.toastr.error(error.error, 'Error');
          } else {
            this.toastr.error('An error occurred', 'Error');
          }
          this.loadingPrograms = false;
        }
    );
  }

  openAddProgramModal() {
    const modalRef = this.modalService.open(AddProgramComponent, {backdrop: false});
    modalRef.componentInstance.programAdded.subscribe(() => {
      this.getPrograms(this.currentPage, this.itemsPerPage, null);
      modalRef.close();
    });
  }

  openEditProgramModal(program: ProgramResponse) {
    const modalRef = this.modalService.open(EditProgramComponent, {backdrop: false});
    modalRef.componentInstance.program = program;
    modalRef.componentInstance.programUpdated.subscribe((updatedProgram: ProgramResponse) => {
      if (updatedProgram != null) {
        const index = this.paginatedPrograms.programs.findIndex(p => p.id === updatedProgram.id);
        if (index !== -1) {
          this.paginatedPrograms.programs[index] = updatedProgram;
        }
      }
      modalRef.close();
    }, (reason) => {
        console.log('Err!', reason);
        modalRef.close();
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

  openGenerateCalendarModal(program: ProgramResponse) {
    const modalRef = this.modalService.open(GenerateCalendarComponent, {backdrop: false});
    modalRef.componentInstance.programResponse = program;
    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
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

  

  // Fonction unique pour fermer le modal
  closeStatsModal(): void {
    this.statsModalVisible = false;
    this.currentStats = null;
  }



  // Ajoutez cette méthode
  loadProgramStats(programId: string): void {
    this.loadingStats = true;
    this.currentStats = null;
    
    this.programService.getProgramProgress(programId).subscribe({
      next: (stats) => {
        this.currentStats = stats;
        this.statsModalVisible = true;
        this.loadingStats = false;
      },
      error: (err) => {
        this.loadingStats = false;
        if (err.status === 404) {
          this.toastr.error('Programme non trouvé');
        } else {
          this.toastr.error('Erreur lors du chargement des statistiques');
        }
      }
    });
  }
  showProgramStats(program: ProgramResponse | string): void {
    // Debug initial
    console.log('Paramètre program reçu:', program);
    console.log('Type de program:', typeof program);
  
    // Gestion différente selon le type
    const programId = typeof program === 'string' 
      ? program 
      : program?.id;
  
    if (!programId) {
      console.error('ID manquant - Détails:', {
        param: program,
        type: typeof program
      });
      this.toastr.error('Identifiant du programme manquant');
      return;
    }
  
    console.log('ID du programme à traiter:', programId); // Debug
  
    this.loadingStats = true;
    
    this.programService.getProgramProgress(programId).subscribe({
      next: (stats) => {
        console.log('Stats reçues:', stats); // Debug
        
        const modalRef = this.modalService.open(ProgramStatsModalComponent, { 
          backdrop: false,
          size: 'lg'
        });
        
        modalRef.componentInstance.stats = stats;
        
        // Passez l'ID même si program est une string
        modalRef.componentInstance.program = {
          id: programId,
          name: typeof program === 'object' ? program.name : 'Programme'
        };
        
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Erreur API détaillée:', {
          error: err,
          url: err.url,
          status: err.status
        });
        this.loadingStats = false;
        this.toastr.error(`Erreur technique: ${err.status} - ${err.message}`);
      }
    });
  }
  
  private getEmptyStats() {
    return {
      completedCourses: 0,
      totalCourses: 0,
      remainingCourses: 0,
      completionPercentage: 0,
      modules: [],
      isEmpty: true
    };
  }


}