import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {InstitutionRequest} from '../../../shared/models/institution/InstitutionRequest';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {ResponseHandlerService} from '../../../shared/services/user/response-handler.service';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../../shared/services/user/user.service';
import * as L from 'leaflet';
import {InstitutionMapRequest} from '../../../shared/models/institution/InstitutionMapRequest';
import {CalendarEventRequest} from '../../../shared/models/institution/CalendarEventRequest';
import {environment} from '../../../../environments/environment';
import {SemesterRequest} from '../../../shared/models/institution/SemesterRequest';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import {InstitutionTimeSlot} from '../../../shared/models/institution/InstitutionTimeSlot';
import {InstitutionTimeSlotConfiguration} from '../../../shared/models/institution/InstitutionTimeSlotConfiguration';
import { Room, RoomService } from 'src/app/shared/services/room-service.service';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent implements OnInit {

    constructor(
      private institutionService: InstitutionService,
      private handleResponse: ResponseHandlerService,
      private formBuilder: FormBuilder,
      private toastr: ToastrService,
      private route: ActivatedRoute,
        private userService: UserService
  ) {
        this.timeslotForm = this.formBuilder.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required]
        }, { validators: [this.timeOrderValidator, this.overlappingTimesValidator.bind(this)] });
        this.daysForm = this.formBuilder.group({
            selectedDays: [[]]
        });
    }
    daysForm: FormGroup;
    daysSelected = false;
    days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    selectedDays: string[] = [];
    timeslotForm: FormGroup;
    timeslots: InstitutionTimeSlot[] = [];
    selectedFileName: string;
    selectedFileUrl: string | ArrayBuffer;
    file: any;
    generationEvent: CalendarEventRequest = {};
    institutionTimeSlotsConfiguration: InstitutionTimeSlotConfiguration;
    year: number = new Date().getFullYear(); // Set current year as default
    events: Event[] = []; // User-defined events
    today = new Date();
    bsValue = {
        year: this.today.getFullYear(),
        month: this.today.getMonth() + 1,
        day: this.today.getDate()
    };
    maxDate = {
        year: 2024,
        month: 12,
        day: 31
    };
    minDate = {
        year: 2024,
        month: 1,
        day: 1
    };
    institutionID: string;
    currentInstitution: InstitutionResponse;
    institutionMapRequest: InstitutionMapRequest = {};
    loading = false;
    countries = [];
    private map: L.Map | undefined;
    @ViewChild('page', { static: false }) pageTemplate: TemplateRef<any>;
    private marker: L.Marker | undefined;
    latitude = 0;
    longitude = 0;
  updateInstitutionForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(40), Validators.minLength(3)]],
        slogan: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
        country: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(10)]],
        description: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(10)]],
        website: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(5)]],
      }
  );
    generateForm = this.formBuilder.group({
        startDate: [this.bsValue, [Validators.required]],
        finishDate: [this.bsValue, [Validators.required]],
        name: ['', [Validators.required, Validators.maxLength(15)]],
        color: ['#FFFF00', [Validators.required]],
    }, { validators: [this.sameMonth, this.dateOrder] });
    firstSemesterBSValue = {
        year: this.today.getFullYear(),
        month: 1,
        day: 1
    };
    secondSemesterBSValue = {
        year: this.today.getFullYear(),
        month: 6,
        day: 1
    };
    SetSemesterForm = this.formBuilder.group({
        firstSemesterStart: [this.firstSemesterBSValue, [Validators.required]],
        secondSemesterStart: [this.secondSemesterBSValue, [Validators.required]],
    });

  ngOnInit() {
 
      this.generationEvent.startDate = new Date();
      this.institutionID = this.route.snapshot.paramMap.get('institutionID');
      this.loadTimeslots();
      this.userService.getCountries().subscribe(
          countries => {
              this.countries = countries;
              console.log(this.countries);
          }
      );

      this.institutionService.getInstitutionByID(this.institutionID).subscribe(
            response => {
                this.currentInstitution = response;
                this.updateInstitutionForm.patchValue(
                    {
                        name: this.currentInstitution.name,
                        slogan: this.currentInstitution.slogan,
                        country: this.currentInstitution.country,
                        address: this.currentInstitution.address,
                        description: this.currentInstitution.description,
                        website: this.currentInstitution.website
                    }
                );
               
            }, error => {
                this.handleResponse.handleError(error);
            }
      );
  }

   onDayChange(event: any) {
        const day = event.target.value;
        if (event.target.checked) {
            this.selectedDays.push(day);
        } else {
            this.selectedDays = this.selectedDays.filter(d => d !== day);
        }
    }
    selectDays() {
        this.selectedDays = this.daysForm.value.selectedDays;
        if (this.selectedDays.length > 0) {
            this.daysSelected = true;
        }
    }
    setEligibleTimes() {
        this.timeslots.push(this.timeslotForm.value);
        this.timeslotForm.reset(); // Reset the form after adding a time slot
    }
    timeOrderValidator(control: FormGroup): ValidationErrors | null {
        const startTime = control.get('startTime')?.value;
        const endTime = control.get('endTime')?.value;

        if (startTime && endTime && startTime >= endTime) {
            return { timeOrder: true };
        }
        return null;
    }

    overlappingTimesValidator(control: FormGroup): ValidationErrors | null {
        const startTime = control.get('startTime')?.value;
        const endTime = control.get('endTime')?.value;

        if (startTime && endTime) {
            for (const slot of this.timeslots) {
                if (
                    (startTime >= slot.startTime && startTime < slot.endTime) ||
                    (endTime > slot.startTime && endTime <= slot.endTime) ||
                    (startTime <= slot.startTime && endTime >= slot.endTime)
                ) {
                    return { overlappingTimes: true };
                }
            }
        }
        return null;
    }
   
    generateTimetable() {
        const loadingToastr = this.toastr.info('Generating timetable... This could take a few minutes.',
            'Please wait', { disableTimeOut: true });
        this.institutionService.generateTimetable(this.institutionID).subscribe(
            response => {
                this.toastr.clear(loadingToastr.toastId);
                this.toastr.success('Timetable generated successfully.');
            },
            error => {
                this.toastr.clear(loadingToastr.toastId);
                if (error.error) {
                    this.toastr.error(error.error);
                } else {
                    this.toastr.error('Error generating timetable.');
                }
            }
        );
    }
    loadTimeslots() {
      console.log('Loading timeslots');
        this.institutionService.getInstitutionTimeSlots(this.institutionID).subscribe(timeslots => {
            this.institutionTimeSlotsConfiguration = timeslots;
            this.timeslots = timeslots.timeSlots;
            this.selectedDays = timeslots.days;
        });
    }
    addTimeslot() {
        if (this.timeslotForm.valid) {
            this.timeslots.push(this.timeslotForm.value);
            this.timeslotForm.reset();
        }
    }

    removeTimeslot(index: number) {
        this.timeslots.splice(index, 1);
    }

    updateInstitutionTimeSlots(institutionID: string) {
      const institutionTimeSlotsConfiguration: InstitutionTimeSlotConfiguration = {
            days: this.selectedDays,
            timeSlots: this.timeslots
        };
        this.institutionService.updateInstitutionTimeSlots(institutionID, institutionTimeSlotsConfiguration).subscribe(response => {
            this.toastr.success('Timeslots updated successfully.');
        }, error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Error updating timeslots.');
            }
            }
            );
    }
    clearSemester() {
        this.institutionService.clearSemester(this.institutionID).subscribe(
            response => {
                this.toastr.success('Semester cleared successfully.');
                this.currentInstitution.firstSemesterStart = null;
                this.currentInstitution.secondSemesterStart = null;
            }, error => {
                if (error.error) {
                    this.toastr.error(error.error);
                } else {
                    this.toastr.error('Error clearing semester.');
                }
            });
    }
    setSemester() {
        if (this.SetSemesterForm.valid) {
            const semester: SemesterRequest = {
                firstSemesterStart: new Date(this.SetSemesterForm.controls['firstSemesterStart'].value.year,
                    this.SetSemesterForm.controls['firstSemesterStart'].value.month - 1,
                    this.SetSemesterForm.controls['firstSemesterStart'].value.day),
                secondSemesterStart: new Date(this.SetSemesterForm.controls['secondSemesterStart'].value.year,
                    this.SetSemesterForm.controls['secondSemesterStart'].value.month - 1,
                    this.SetSemesterForm.controls['secondSemesterStart'].value.day)
            };
            this.institutionService.setSemester(this.institutionID, semester).subscribe(
                response => {
                    this.toastr.success('Semester set successfully.');
                    this.currentInstitution.firstSemesterStart = semester.firstSemesterStart;
                    this.currentInstitution.secondSemesterStart = semester.secondSemesterStart;
                }, error => {
                    if (error.error) {
                        this.toastr.error(error.error);
                    } else {
                        this.toastr.error('Error setting semester.');
                    }
                }
            );
        } else {
            this.toastr.error('Please fill all fields');
        }
    }
    returnEvent(form: FormGroup): CalendarEventRequest {
        return Object.assign(this.generationEvent, form.value, {color: form.controls['color'].value});
    }
    dateOrder(control: FormGroup): {[key: string]: boolean} | null {
        const startDate = new Date(control.get('startDate').value.year,
            control.get('startDate').value.month - 1, control.get('startDate').value.day);
        const finishDate = new Date(control.get('finishDate').value.year, control.get('finishDate').value.month - 1, control.get('finishDate').value.day);
        if (startDate && finishDate && startDate.getTime() > finishDate.getTime()) {
            return {'invalidDateOrder': true};
        }
        return null;
    }
    isOverlapping(event1: CalendarEventRequest, event2: CalendarEventRequest): boolean {
        return new Date(event1.startDate).getTime() <= new Date(event2.finishDate).getTime() &&
            new Date(event1.finishDate).getTime() >= new Date(event2.startDate).getTime();
    }
    sameMonth(control: FormGroup): {[key: string]: boolean} | null {
        const startDate = new Date(control.get('startDate').value.year,
            control.get('startDate').value.month - 1, control.get('startDate').value.day);
        const finishDate = new Date(control.get('finishDate').value.year, control.get('finishDate').value.month - 1, control.get('finishDate').value.day);

        if (startDate && finishDate && startDate.getMonth() !== finishDate.getMonth()) {
            return {'differentMonth': true};
        }

        return null;
    }
}
