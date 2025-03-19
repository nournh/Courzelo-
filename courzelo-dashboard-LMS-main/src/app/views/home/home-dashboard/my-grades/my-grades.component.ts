import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserResponse} from '../../../../shared/models/user/UserResponse';
import {SessionStorageService} from '../../../../shared/services/user/session-storage.service';
import {GradeService} from '../../../../shared/services/institution/grade.service';
import {ToastrService} from 'ngx-toastr';
import {MyGradesResponse} from '../../../../shared/models/institution/MyGradesResponse';
import {CourseResponse} from '../../../../shared/models/institution/CourseResponse';
import {GradeResponse} from '../../../../shared/models/institution/GradeResponse';
import {ProgramService} from '../../../../shared/services/institution/program.service';
import {ProgramResponse} from '../../../../shared/models/institution/ProgramResponse';
export interface ModuleGradesResponse {
    course: CourseResponse;
    grades: GradeResponse[];
    average: number;
}
@Component({
  selector: 'app-my-grades',
  templateUrl: './my-grades.component.html',
  styleUrls: ['./my-grades.component.scss']
})
export class MyGradesComponent implements OnInit {
  user: UserResponse;
  loading = true;
    gradesResponse: MyGradesResponse;
    programResponse: ProgramResponse;
    @Output() close = new EventEmitter<void>();

    constructor(
    private sessionStorageService: SessionStorageService,
    private gradeService: GradeService,
    private programService: ProgramService,
    private toastr: ToastrService

) {
}

  ngOnInit(): void {
        this.sessionStorageService.getUser().subscribe(
            user => {
                this.user = user;
            },
            error => {
                console.log(error);
            }
        );
      this.loadMyGrades();
  }
    onClose(): void {
        this.close.emit();
    }
    loadMyGrades() {
        this.gradeService.getMyGradesByGroup().subscribe(
            grades => {
                this.gradesResponse = grades;
                for (const moduleGradesResponse of this.gradesResponse.grades) {
                    this.calculateStudentAverage(moduleGradesResponse);
                    this.gradesResponse.average = this.calculateStudentTotalAverage();
                }
                this.programService.getMyProgram().subscribe(
                    program => {
                        this.programResponse = program;
                        this.loading = false;
                    },
                    error => {
                        if (error.error) {
                            this.toastr.error(error.error);
                        } else {
                            this.toastr.error('Failed to fetch program');
                        }
                        this.loading = false;
                    }
                );
                this.loading = false;
            },
            error => {
                if (error.error) {
                    this.toastr.error(error.error);
                } else {
                    this.toastr.error('Failed to fetch grades');
                }
                this.loading = false;
            }
        );
    }
    getScoreColorClass(score: number, scoreToPass: number): string {
        const percentage = (score / scoreToPass) * 100;
        if (percentage < 50) {
            return 'text-danger';
        } else if (percentage < 100) {
            return 'text-warning';
        } else if (percentage < 140) {
            return 'text-success';
        } else {
            return 'text-primary';
        }
    }
    calculateStudentAverage(moduleGradesResponse: ModuleGradesResponse) {
        let total = 0;
        let weightSum = 0;
        for (const grade of moduleGradesResponse.grades) {
            total += grade.grade * moduleGradesResponse.course.assessments.find(assessment => assessment.name === grade.name).weight;
            weightSum += moduleGradesResponse.course.assessments.find(assessment => assessment.name === grade.name).weight;
        }
        moduleGradesResponse.average = total / weightSum;
    }
    calculateStudentTotalCredits() {
        let total = 0;
        for (const moduleGradesResponse of this.gradesResponse.grades) {
            if (moduleGradesResponse.average >= moduleGradesResponse.course.scoreToPass) {
                total += moduleGradesResponse.course.credit;
            }
        }
        return total;
    }
    calculateStudentTotalAverage() {
        let total = 0;
        let weightSum = 0;
        for (const moduleGradesResponse of this.gradesResponse.grades) {
            for (const grade of moduleGradesResponse.grades) {
                total += moduleGradesResponse.average * moduleGradesResponse.course.assessments.find(
                    assessment => assessment.name === grade.name).weight;
                weightSum += moduleGradesResponse.course.assessments.find(assessment => assessment.name === grade.name).weight;
            }
        }
        return total / weightSum;
    }

}
