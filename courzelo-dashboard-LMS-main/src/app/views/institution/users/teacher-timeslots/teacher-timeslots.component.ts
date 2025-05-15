import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InstitutionUserResponse} from '../../../../shared/models/institution/InstitutionUserResponse';
import {InstitutionService} from '../../../../shared/services/institution/institution.service';
import {ToastrService} from 'ngx-toastr';
import {InstitutionTimeSlot} from '../../../../shared/models/institution/InstitutionTimeSlot';

@Component({
  selector: 'app-teacher-timeslots',
  templateUrl: './teacher-timeslots.component.html',
  styleUrls: ['./teacher-timeslots.component.scss']
})
export class TeacherTimeslotsComponent implements OnInit {
  @Input() teacher: InstitutionUserResponse;
  @Input() institutionID: string;
  @Output() slotsUpdated = new EventEmitter<InstitutionTimeSlot[]>();
  timeslotForm: FormGroup;
  days: string[] = [];
  timeslots: InstitutionTimeSlot[] = [];
  formInstitutionTimeSlot: InstitutionTimeSlot;
  constructor(private fb: FormBuilder,
              private institutionService: InstitutionService,
              private toastr: ToastrService) {
    this.timeslotForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startEndTime: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInstitutionConfig();
  }
  loadInstitutionConfig() {
    this.institutionService.getInstitutionTimeSlots(this.institutionID).subscribe(config => {
      this.days = config.days;
      this.timeslots = config.timeSlots;
    });
  }
  addTimeslot() {
    if (this.timeslotForm.valid) {
      const selectedTimeslot: InstitutionTimeSlot = this.timeslotForm.value.startEndTime;
      const newTimeslot: InstitutionTimeSlot = {
        dayOfWeek: this.timeslotForm.value.dayOfWeek,
        startTime: selectedTimeslot.startTime,
        endTime: selectedTimeslot.endTime
      };

      // Check if the timeslot already exists
      const exists = this.teacher.disponibilitySlots.some(slot =>
          slot.dayOfWeek === newTimeslot.dayOfWeek &&
          slot.startTime === newTimeslot.startTime &&
          slot.endTime === newTimeslot.endTime
      );

      if (!exists) {
        this.teacher.disponibilitySlots.push(newTimeslot);
        this.updateTimeslots();
      } else {
        this.toastr.error('Timeslot already exists', 'Error');
      }
    }
  }
  updateTimeslots() {
    this.institutionService.updateTeacherDisponibility(this.teacher.email, this.teacher.disponibilitySlots).subscribe(
        (response) => {
          this.toastr.success('Timeslot added successfully', 'Success');
          this.timeslotForm.reset();
        }, error => {
          if (error.error) {
            this.toastr.error(error.error, 'Error');
          } else {
            this.toastr.error('An error occurred', 'Error');
          }
          this.teacher.disponibilitySlots.pop();
        }
    );
  }
  teacherTimeslotsUpdated() {
    this.slotsUpdated.emit(this.teacher.disponibilitySlots);
  }
  removeTimeslot(index: number) {
    this.teacher.disponibilitySlots.splice(index, 1);
  }
}