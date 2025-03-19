import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GroupResponse} from '../../../../shared/models/institution/GroupResponse';
import {CourseService} from '../../../../shared/services/institution/course.service';
import {CourseResponse} from '../../../../shared/models/institution/CourseResponse';
import {ToastrService} from 'ngx-toastr';
import {ClassroomService} from '../../../../shared/services/institution/classroom.service';
import {ClassRoomRequest} from '../../../../shared/models/institution/ClassRoomRequest';
import {GroupService} from '../../../../shared/services/institution/group.service';
import {AssignTeacherComponent} from './assign-teacher/assign-teacher.component';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {StudentGradesComponent} from '../../../../shared/components/student-grades/student-grades.component';
import {ModuleService} from "../../../../shared/services/institution/module.service";
import {ModuleResponse} from "../../../../shared/models/institution/ModuleResponse";

@Component({
  selector: 'app-view-courses',
  templateUrl: './view-courses.component.html',
  styleUrls: ['./view-courses.component.scss']
})
export class ViewCoursesComponent implements OnInit {

  @Input() program: string;
  @Input() group: GroupResponse;
  @Input() module: CourseResponse;
    currentCourse: CourseResponse;
    modules: ModuleResponse[] = [];
  @Output() close = new EventEmitter<void>();
  loading = false;
    showFullDescription: { [key: string]: boolean } = {};
    courses: CourseResponse[] = [];
  constructor(
      private courseService: CourseService,
      private toastr: ToastrService,
      private classroomService: ClassroomService,
      private groupService: GroupService,
      private moduleService: ModuleService,
      private modalService: NgbModal,
  ) {
  }
  ngOnInit(): void {
  this.fetchModules();
  }
    fetchModules() {
        this.loading = true;
        this.moduleService.getAllModules(this.program, 0, 99, "").subscribe(
            modules => {
                this.modules = modules.modules;
                if(modules.modules.length > 0){
                let remainingModules = modules.modules.length;
                console.log(modules.modules.length);
                modules.modules.forEach(module => {
                    module.courses = [];
                    this.courseService.getCourses(0,99,module.id,"").subscribe(
                        courses => {
                            courses.courses.forEach(course => {
                                course.classroomCreated = false;
                                if(this.group.classrooms) {
                                    for (const classroom of this.group.classrooms) {
                                        if (classroom.course === course.id) {
                                            course.classroomCreated = true;
                                            course.classroomID = classroom.classroomID;
                                            course.classroomTeacher = classroom.teacher;
                                            break;
                                        }
                                    }
                                }
                                module.courses.push(course);
                                console.log(courses);
                            });

                            remainingModules--;
                            if (remainingModules === 0) {
                                this.loading = false;
                                console.log(this.courses);
                            }
                        },
                        error => {
                            this.toastr.error('Failed to fetch courses for module ' + module.id);
                            remainingModules--;
                            if (remainingModules === 0) {
                                this.loading = false;
                            }
                        }
                    );
                });
                }else{
                    this.loading = false;
                }
            },
            error => {
                this.toastr.error('Failed to fetch modules');
                this.loading = false;
            }
        );
    }
    toggleDescription(moduleId: string) {
        this.showFullDescription[moduleId] = !this.showFullDescription[moduleId];
    }
    openDeleteCourseModal(module: CourseResponse, content: NgbModalRef) {
        this.currentCourse = module;
        this.modalService.open(content, { ariaLabelledBy: 'modal-title-course' , backdrop: false }).result.then(
            result => {
                if (result === 'Ok') {
                    this.deleteClassroom(module.classroomID);
                }
            },
            reason => {}
        );
    }
    onClose() {
        this.close.emit();
    }
    deleteClassroom(id: string) {
        this.loading = true;
        this.classroomService.deleteClassroom(id).subscribe(
        () => {
            this.toastr.success('Course deleted successfully');
            this.currentCourse = null;
            this.courses = this.courses.filter(m => m.classroomID !== id);
            this.toastr.info('Refresh your page to see changes');
            this.loading = false;
            },
        error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Failed to delete course');
            }
            this.loading = false;
        });
    }
    createClassroom(courseResponse: CourseResponse) {
     const courseRequest: ClassRoomRequest = {
            course: courseResponse.id,
            group: this.group.id,
     };
     this.loading = true;
   this.classroomService.addClassroom(this.group.institutionID, courseRequest).subscribe(
         course => {
              this.toastr.success('Course created successfully');
              console.log(this.group);
              this.groupService.getGroup(this.group.id).subscribe(
                    group => {
                        console.log(group);
                        this.group = group;
                        console.log(this.group);
                        this.fetchModules();
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
         },
         error => {
             if (error.error) {
                    this.toastr.error(error.error);
             } else {
                 this.toastr.error('Failed to create course');
             }
             this.loading = false;
         }
   );
    }
    openStudentsGradesModal(courseResponse: CourseResponse) {
        const modalRef = this.modalService.open(StudentGradesComponent, {size : 'lg', backdrop: false});
        modalRef.componentInstance.groupResponse = this.group;
        modalRef.componentInstance.courseResponse = courseResponse;
        modalRef.componentInstance.mode = 'admin';
        modalRef.componentInstance.close.subscribe(() => {
            modalRef.close();
        });
    }
    openAsssignTeacherModal(module: CourseResponse) {
        const modalRef = this.modalService.open(AssignTeacherComponent, { size : 'sm' , backdrop: false});
        modalRef.componentInstance.module = module;
        modalRef.componentInstance.close.subscribe(() => {
            modalRef.close();
        });
    }
}
