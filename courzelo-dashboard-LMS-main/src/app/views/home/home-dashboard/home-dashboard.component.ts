import {Component, OnInit} from '@angular/core';
import {SessionStorageService} from '../../../shared/services/user/session-storage.service';
import {ClassroomService} from '../../../shared/services/institution/classroom.service';
import {ProgramService} from '../../../shared/services/institution/program.service';
import {ToastrService} from 'ngx-toastr';
import {ClassRoomResponse} from '../../../shared/models/institution/ClassRoomResponse';
import {CourseService} from '../../../shared/services/institution/course.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ProgramResponse} from '../../../shared/models/institution/ProgramResponse';
import {GroupService} from '../../../shared/services/institution/group.service';
import {GroupResponse} from '../../../shared/models/institution/GroupResponse';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ViewStudentsComponent} from '../../../shared/components/view-students/view-students.component';
import {StudentGradesComponent} from '../../../shared/components/student-grades/student-grades.component';
import {MyGradesComponent} from './my-grades/my-grades.component';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import {Timeslot, TimetableResponse} from '../../../shared/models/institution/TimetableResponse';
import {InstitutionTimeSlot} from '../../../shared/models/institution/InstitutionTimeSlot';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
  constructor(
      private sessionstorage: SessionStorageService,
      private classroomService: ClassroomService,
      private programService: ProgramService,
      private groupService: GroupService,
      private institutionService: InstitutionService,
      private courseService: CourseService,
      private toastr: ToastrService,
      private userService: UserService,
      private sanitizer: DomSanitizer,
      private modalService: NgbModal
  ) {
  }
  currentUser = this.sessionstorage.getUserFromSession();
  myProgram: ProgramResponse;
  myGroup: GroupResponse;
  loadingTimetable = false;
  myInstitution: InstitutionResponse;
  timetable: TimetableResponse;
  timeTableSlots: InstitutionTimeSlot[];
  sanitizedWebsiteUrl: SafeUrl;
  loading = false;
  classrooms: ClassRoomResponse[] = [];
  objectKeys = Object.keys;
  student = { program: 'Bachelor in Computer Science', group: 'Group A', advisor: 'Dr. Emily White' };
  announcements = ['New Semester Registration Open', 'Library Hours Updated'];

  ngOnInit(): void {
      this.fetchCourses();
      this.fetchProgram();
      this.fetchGroup();
      this.fetchInstitution();
  }
  openStudentsGradesModal(groupID: string, moduleID: string) {
    const modalRef = this.modalService.open(StudentGradesComponent, {size : 'lg', backdrop: false});
    modalRef.componentInstance.groupID = groupID;
    modalRef.componentInstance.moduleID = moduleID;
    modalRef.componentInstance.mode = 'teacher';
    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
    });
  }
  openMyGradesModal() {
    const modalRef = this.modalService.open(MyGradesComponent, {size : 'lg', backdrop: false});
    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
    });
  }
  getGroupObject(groupKey: string): { [key: string]: Timeslot[] } {
    return { [groupKey]: this.timetable.groupTimetables[groupKey] };
  }
  getTeacherObject(teacherKey: string): { [key: string]: Timeslot[] } {
    return { [teacherKey]: this.timetable.teacherTimetables[teacherKey] };
  }
  fetchCourses(): void {
    this.loading = true;
    this.classroomService.getMyClassrooms().subscribe((courses) => {
      this.classrooms = courses;
      this.classrooms.forEach((course) => {
        this.courseService.getCourse(course.course).subscribe((module) => {
          course.name = module.name;
          course.description = module.description;
          course.credit = module.credit;
        });
        if (course.teacher) {
          this.userService.getProfileImageBlobUrl(course.teacher).subscribe((blob: Blob) => {
            const objectURL = URL.createObjectURL(blob);
            course.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          });
        }

      });
      console.log(this.classrooms);
        this.loading = false;
    }, (error) => {
      if (error.error) {
        this.toastr.error(error.error, 'Error');
      } else {
        this.toastr.error('An error occurred', 'Error');
      }
      this.loading = false;
        });
  }
  fetchProgram(): void {
    this.programService.getMyProgram().subscribe((program) => {
        this.myProgram = program;
    });
  }
  fetchInstitution(): void {
    this.institutionService.getInstitutionByID(this.currentUser?.education?.institutionID).subscribe((institution) => {
      this.myInstitution = institution;
      this.sanitizedWebsiteUrl = this.sanitizer.bypassSecurityTrustUrl(institution.website);
        this.fetchTimetable();
    });
  }
  fetchGroup(): void {
    this.groupService.getMyGroup().subscribe((group) => {
        this.myGroup = group;
    });
  }
  fetchTimetable(): void {
    this.loadingTimetable = true;
    this.institutionService.getTimetable(this.myInstitution.id).subscribe((timetable) => {
        console.log(timetable);
        this.timetable = timetable;
      this.institutionService.getInstitutionTimeSlots(this.myInstitution.id).subscribe((timeSlots) => {
        this.timeTableSlots = timeSlots.timeSlots.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.startTime}:00`).getTime();
          const timeB = new Date(`1970-01-01T${b.startTime}:00`).getTime();
          return timeA - timeB;
        });
      });
        this.loadingTimetable = false;
    }, (error) => {
      if (error.error) {
        this.toastr.error(error.error, 'Error');
      } else {
        this.toastr.error('An error occurred', 'Error');
      }
      this.loadingTimetable = false;
    });
  }
  downloadExcel() {
    this.programService.downloadExcel(this.myProgram.id).subscribe(
        response => {
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.myProgram.name + '.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error => {
          if (error.error) {
            this.toastr.error(error.error, 'Error');
          } else {
            this.toastr.error('An error occurred', 'Error');
          }
        }
    );
  }
  openViewStudentsModal(group: GroupResponse) {
    const modalRef = this.modalService.open(ViewStudentsComponent, { size : 'lg' , backdrop: false});
    modalRef.componentInstance.group = group;
    modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
    });
  }
}
