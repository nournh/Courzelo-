
import {Component, OnInit} from '@angular/core';
import {Semester, TimeTable} from '../../../../shared/models/Timetable/Timetable';
import {GroupResponse} from '../../../../shared/models/institution/GroupResponse';
import {ElementModule} from '../../../../shared/models/Timetable/ElementModule';
import {ToastrService} from 'ngx-toastr';
import {AuthenticationService} from '../../../../shared/services/user/authentication.service';
import {ElementModuleService} from '../../../../shared/services/Timetable/element-module.service';
import {TimetableService} from '../../../../shared/services/Timetable/timetable.service';
import {GroupService} from '../../../../shared/services/institution/group.service';
import { jsPDF } from 'jspdf';
import {SessionStorageService} from '../../../../shared/services/user/session-storage.service';
import {UserResponse} from '../../../../shared/models/user/UserResponse';
import {FormGroup, Validators} from '@angular/forms';
import {ClassRoomResponse} from '../../../../shared/models/institution/ClassRoomResponse';
import {ClassroomService} from '../../../../shared/services/institution/classroom.service';
import {UserService} from '../../../../shared/services/user/user.service';
@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent implements OnInit {
    prof!: boolean;
    public semsters: Semester[] = [];
    public classes: GroupResponse[] = [];
    public elementModule1: ElementModule[] = [];
    classe!: GroupResponse;
    spinnerExport = false;
    ready = false;
    admin = false;
    spinnerGenerate = false;
    generateStatus = false;
    elementModuleForm: FormGroup;
    courses: ClassRoomResponse[] = [];
    teachers: UserResponse[] = [];
    groups: GroupResponse[] = [];
    private fb: any;
    elementModule = {
    };
    constructor(
        private toastr: ToastrService,
        private authenticationService: AuthenticationService,
        private TimeTableService: TimetableService,
        private elementModuleService: ElementModuleService,
        private classService: GroupService,
        private sessionStorage: SessionStorageService,
        private courseService: ClassroomService,
        private userService: UserService
    ) {
    }

    ngOnInit() {
        this.loadCourses();
        this.loadGroups();
        this.loadTeachers();
        this.initializeForm();
        const userResponse = this.sessionStorage.getUserFromSession();
        if (userResponse?.roles?.includes('TEACHER')) {
            this.prof = true;
            this.ready = true;
            if (userResponse?.id) {
                this.TimeTableService.getEmploiByProf(userResponse.id).subscribe(
                    data => {
                        this.elementModule1 = data;
                        this.toastr.success('Timetable loaded successfully');
                    },
                    error => {
                        this.toastr.error('Failed to load timetable');
                    }
                );
            }
        } else if (userResponse?.roles?.includes('ADMIN')) {
            this.admin = true;
        }
    }
    initializeForm(): void {
        this.elementModuleForm = this.fb.group({
            name: ['', Validators.required],
            nmbrHours: ['', [Validators.required, Validators.min(1)]],
            course: ['', Validators.required],
            teacher: ['', Validators.required],
            group: ['', Validators.required]
        });
    }

    // Load data for dropdowns from backend
    loadCourses() {
        this.elementModuleService.getCourses().subscribe(
            (data) => {
                this.courses = data;
            },
            (error) => {
                console.error('Error loading courses', error);
                this.toastr.error('Error loading courses');
            }
        );
    }

    loadGroups() {
        this.elementModuleService.getGroups().subscribe(
            (data) => {
                this.groups = data;
            },
            (error) => {
                console.error('Error loading groups', error);
                this.toastr.error('Error loading groups');
            }
        );
    }

    loadTeachers() {
        this.elementModuleService.getTeachers().subscribe(
            (data) => {
                this.teachers = data;
            },
            (error) => {
                console.error('Error loading teachers', error);
                this.toastr.error('Error loading teachers');
            }
        );
    }

    onSubmit1() {
        // Pass the elementModule object to the service method
        this.elementModuleService.createElementModule(this.elementModule).subscribe(
            (response) => {
                console.log('Element module created', response);
                this.toastr.success('Element module created successfully');
            },
            (error) => {
                console.error('Error creating element module', error);
                this.toastr.error('Error creating element module');
            }
        );
    }


    // Submit form to create a new element module
    onSubmit(): void {
        if (this.elementModuleForm.invalid) {
            this.toastr.error('Please fill out the form correctly', 'Form Error');
            return;
        }

        const elementModuleData = this.elementModuleForm.value;
        this.elementModuleService.createElementModule(elementModuleData).subscribe(
            response => {
                this.toastr.success('Element Module created successfully!', 'Success');
                this.elementModuleForm.reset();
            },
            error => {
                this.toastr.error('Error creating element module', 'Error');
            }
        );
    }
    fetchElementModules(): void {
        this.elementModuleService.getAllElementModules().subscribe(
            elements => {
                this.elementModule1 = elements;
                this.toastr.success('Element modules fetched successfully');
            }, error => {
                this.toastr.error('Failed to fetch element modules');
            }
        );
    }
    handleExport() {
        this.toastr.info(
            'Click here to confirm export',
            'Would you like to export data?',
            {
                timeOut: 5000,
                tapToDismiss: true,
                closeButton: true,
                positionClass: 'toast-top-left',
                enableHtml: true
            }
        ).onTap.subscribe(() => {
            this.spinnerExport = true;

            this.TimeTableService.exportFile().subscribe(
                data => {
                    this.spinnerExport = false;
                    console.log(data);
                    downloadFile(data, 'application/pdf');
                    this.toastr.success('Data exported successfully!', 'Success', {
                        timeOut: 3000,
                        positionClass: 'toast-top-right'
                    });
                },
                error => {
                    this.spinnerExport = false;
                    console.log(error);
                    this.toastr.error('An error occurred during exporting.', 'Error', {
                        timeOut: 3000,
                        positionClass: 'toast-top-right'
                    });
                }
            );
        });
    }

    handleDownloadEmploi() {
        this.spinnerExport = true;
        this.toastr.info('Preparing to export data...');
        if (this.prof) {
            const userResponse = this.sessionStorage.getUserFromSession();
            if (userResponse?.id) {
                this.TimeTableService.exportFileProf(userResponse.id).subscribe(
                    (data: Blob) => {
                        this.spinnerExport = false;
                        const url = window.URL.createObjectURL(data);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'file.pdf');
                        document.body.appendChild(link);
                        link.click();
                        this.toastr.success('File exported successfully');
                    },
                    error => {
                        this.spinnerExport = false;
                        this.toastr.error('An error occurred during export');
                    }
                );
            }
        }
    }
    handleGenerate() {
        this.toastr.info(
            'Click here to confirm generation',
            'Would you like to generate the timetable? This may take some time.',
            {
                timeOut: 5000,
                tapToDismiss: true,
                closeButton: true,
                positionClass: 'toast-top-right',
                enableHtml: true
            }
        ).onTap.subscribe(() => {
            this.spinnerGenerate = true;

            this.TimeTableService.generateEmploi().subscribe(
                data => {
                    this.generateStatus = true;
                    this.spinnerGenerate = false;
                    this.toastr.success('Timetables generated successfully!', 'Generated', {
                        timeOut: 3000,
                        positionClass: 'toast-top-right'
                    });
                },
                error => {
                    this.spinnerGenerate = false;
                    this.toastr.error('An error occurred while generating the timetable.', 'Error', {
                        timeOut: 3000,
                        positionClass: 'toast-top-left'
                    });
                }
            );
        });
    }

    generatePDF(): void {
        const doc = new jsPDF();
        let content = 'Timetable:\n\n';
        this.elementModule1.forEach((module, index) => {
            content += `Module ${index + 1}:\n`;
            content += `Name: ${module.name}\n`;
            content += `Number of Hours: ${module.nmbrHours}\n`;
            content += `Day of Week: ${module.dayOfWeek}\n`;
            content += `Period: ${module.period}\n`;
           // content += `Teacher: ${module.teacher.profile?.name} ${module.teacher.profile?.lastname}\n\n`;
        });

        doc.text(content, 10, 10);
        doc.save('timetable.pdf');
        this.toastr.success('PDF generated successfully');
    }

    getEmplois() {
        // Fetch all classes from the service
        this.classService.getAllClasses().subscribe(
            (data: any) => {
                if (data && Array.isArray(data)) {
                    this.classe = data[0];
                    const classeId = this.classe.id;
                    this.TimeTableService.getEmploisByClasse(classeId).subscribe(
                        (timetableData: ElementModule[]) => {
                            this.elementModule1 = timetableData;
                            this.toastr.success('Timetables loaded successfully');
                        },
                        error => {
                            this.toastr.error('Failed to load timetables');
                        }
                    );
                } else {
                    this.toastr.error('Unexpected response format');
                }
            },
            error => {
                this.toastr.error('Failed to fetch classes');
            }
        );
    }
    // Method to check if a module (course) exists for a given day and time period
    hasModule(day: string, period: string): boolean {
        // Use a different name to avoid shadowing
        return this.elementModule1.some(elem => elem.dayOfWeek === day && elem.period === period);
    }
   /* getModuleTitle(day: string, period: string): string {
        const foundElement = this.elementModule1.find(elem => elem.dayOfWeek === day && elem.period === period);
        return foundElement && foundElement.modul ? foundElement.modul.name : '';
    }
    getModuleTeacher(day: string, period: string): string {
        const foundElement = this.elementModule1.find(elem => elem.dayOfWeek === day && elem.period === period);
        return foundElement && foundElement.teacher ? `${foundElement.teacher.profile?.name} ${foundElement.teacher.profile?.lastname}` : '';
    }*/


}

    function downloadFile(data: Blob, arg1: string) {
  const blob = new Blob([data], { type: arg1 });
  const url = window.URL.createObjectURL(blob);
  window.open(url);
}

