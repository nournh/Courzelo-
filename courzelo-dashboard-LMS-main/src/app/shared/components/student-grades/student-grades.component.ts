import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {GradeService} from '../../services/institution/grade.service';
import {GroupResponse} from '../../models/institution/GroupResponse';
import {GroupService} from '../../services/institution/group.service';
import {CourseService} from '../../services/institution/course.service';
import {CourseResponse} from '../../models/institution/CourseResponse';
import {StudentGrades} from '../../models/institution/StudentGrades';
import {UserService} from '../../services/user/user.service';

@Component({
  selector: 'app-student-grades',
  templateUrl: './student-grades.component.html',
  styleUrls: ['./student-grades.component.scss']
})
export class StudentGradesComponent implements OnInit {
  studentGrades: StudentGrades[] = [];
  @Input() groupResponse: GroupResponse;
  @Input() courseResponse: CourseResponse;
    @Input() groupID: string;
    @Input() moduleID: string;
  @Input() mode: 'admin' | 'teacher' = 'teacher';
    @Output() close = new EventEmitter<void>();
  loading = false;

  constructor(
      private toastr: ToastrService,
      private gradeService: GradeService,
      private groupService: GroupService,
      private moduleService: CourseService,
      private userService: UserService
  ) {
  }

  ngOnInit(): void {
      this.loading = true;
      console.log(this.groupResponse);
        console.log(this.courseResponse);
        console.log(this.groupID);
        console.log(this.moduleID);
      if (this.groupResponse == null && this.groupID != null) {
          this.groupService.getGroup(this.groupID).subscribe(
              fetchedGroup => {
                  this.groupResponse = fetchedGroup;
                  console.log(this.groupResponse);
                    this.checkAndLoadModule();
              },
              error => {
                  if (error.error) {
                      this.toastr.error(error.error);
                  } else {
                      this.toastr.error('Failed to fetch group');
                  }
                  this.loading = false;
              }
          );
      }
      if (this.groupResponse && this.courseResponse) {
            this.loadStudentGrades();
      }
  }
  checkAndLoadModule(): void {
      if (this.courseResponse == null && this.moduleID != null) {
          this.moduleService.getCourse(this.moduleID).subscribe(
              module => {
                  this.courseResponse = module;
                  this.loadStudentGrades();
              },
              error => {
                  if (error.error) {
                      this.toastr.error(error.error);
                  } else {
                      this.toastr.error('Failed to fetch module');
                  }
                  this.loading = false;
              }
          );
      } else if (this.groupResponse && this.courseResponse) {
          console.log(this.groupResponse);
          console.log(this.courseResponse);
          this.loadStudentGrades();
      }
  }
  updateGradeValidity(gradeID: string) {
    this.loading = true;
    this.gradeService.updateGradeValidity(gradeID).subscribe(
        () => {
            this.toastr.success('Grade validity updated successfully');
            this.studentGrades.forEach(studentGrade => {
                Object.keys(studentGrade.grades).forEach(assessmentName => {
                    if (studentGrade.grades[assessmentName].gradeID === gradeID) {
                        studentGrade.grades[assessmentName].valid = !studentGrade.grades[assessmentName].valid;
                    }
                });
            });
            this.loading = false;
        },
        error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Failed to update grade validity');
            }
            this.loading = false;
        }
    );
  }
    calculateStudentAverage(studentGrade: StudentGrades): number {
        let total = 0;
        let weightSum = 0;
        this.courseResponse.assessments.forEach(assessment => {
            total += studentGrade.grades[assessment.name].score * assessment.weight;
            weightSum += assessment.weight;
        });
        return total / weightSum;
    }
    calculateClassAverage(): number {
        let total = 0;
        this.studentGrades.forEach(studentGrade => {
            total += this.calculateStudentAverage(studentGrade);
        });
        return total / this.studentGrades.length;
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
  loadStudentGrades(): void {
    this.loading = true;
    console.log(this.groupResponse);
    console.log(this.courseResponse);
    if (!this.groupResponse || !this.courseResponse || !this.groupResponse.students || !this.courseResponse.assessments) {
        this.loading = false;
        return;
    }
    this.groupResponse.students.forEach(student => {
        const studentGrade: StudentGrades = {
            studentEmail: student,
            image: '',
            grades: {},
        };
        this.courseResponse.assessments.forEach(assessment => {
            studentGrade.grades[assessment.name] = { gradeID: '', score: 0, valid: true, validityFound: false };
        });


        this.studentGrades.push(studentGrade);
    });
      this.studentGrades.forEach(studentGrade => {
          this.userService.getProfileImageBlobUrl(studentGrade.studentEmail).subscribe(
              image => {
                  const imageUrl = image ? URL.createObjectURL(image) : null;
                  studentGrade.image = imageUrl;
                  this.loading = false;
              },
              error => {
                  studentGrade.image = null;
                  this.loading = false;
              }
          );
      });
    this.gradeService.getGradesByGroupAndCourse(this.groupResponse.id, this.courseResponse.id).subscribe(
        grades => {
            this.studentGrades.forEach(studentGrade => {
            this.courseResponse.assessments.forEach(assessment => {
                const grade = grades.find(g => g.studentEmail === studentGrade.studentEmail && g.name === assessment.name);
                if (grade) {
                    studentGrade.grades[assessment.name].gradeID = grade.id;
                    studentGrade.grades[assessment.name].score = grade.grade;
                    if (grade.valid != null) {
                        studentGrade.grades[assessment.name].valid = grade.valid;
                        studentGrade.grades[assessment.name].validityFound = true;
                    }
            }});
            });
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
  onSave(): void {
    this.loading = true;
    const gradeRequests = [];
    this.studentGrades.forEach(studentGrade => {
        Object.keys(studentGrade.grades).forEach(assessmentName => {
            const gradeRequest = {
                groupID: this.groupResponse.id,
                moduleID: this.courseResponse.id,
                studentEmail: studentGrade.studentEmail,
                name: assessmentName,
                grade: studentGrade.grades[assessmentName].score,
            };
            gradeRequests.push(gradeRequest);
        });
    });
    this.gradeService.addGrades(gradeRequests).subscribe(
        () => {
            this.toastr.success('Grades saved successfully');
            this.loading = false;
        },
        error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Failed to save grades');
            }
            this.loading = false;
        }
    );
  }

  onClose(): void {
    this.close.emit();
  }
}
