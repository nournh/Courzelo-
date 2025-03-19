import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProgramService} from '../../../../shared/services/institution/program.service';
import {ToastrService} from 'ngx-toastr';
import {CalendarEventRequest} from '../../../../shared/models/institution/CalendarEventRequest';
import {ProgramResponse} from '../../../../shared/models/institution/ProgramResponse';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-generate-calendar',
  templateUrl: './generate-calendar.component.html',
  styleUrls: ['./generate-calendar.component.scss']
})
export class GenerateCalendarComponent {
  @Output() close = new EventEmitter<void>();
  @Input() programResponse: ProgramResponse;
  generationEvent: CalendarEventRequest = {};
  generationEventList: CalendarEventRequest[] = [];
  today = new Date();
  bsValue = {
    year: this.today.getFullYear(),
    month: this.today.getMonth() + 1,
    day: this.today.getDate()
  };
  constructor(
      private programService: ProgramService,
      private toastr: ToastrService,
      private formBuilder: FormBuilder,
  ) {
  }
  generateForm = this.formBuilder.group({
    startDate: [this.bsValue, [Validators.required]],
    finishDate: [this.bsValue, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(15)]],
    color: ['#FFFF00', [Validators.required]],
  }, { validators: [this.sameMonth, this.dateOrder] });
  returnEvent(form: FormGroup): CalendarEventRequest {
    return Object.assign(this.generationEvent, form.value, {color: form.controls['color'].value});
  }
  dateOrder(control: FormGroup): {[key: string]: boolean} | null {
    const startDate = new Date(control.get('startDate').value.year,
        control.get('startDate').value.month - 1, control.get('startDate').value.day);
    const finishDate = new Date(control.get('finishDate').value.year,
        control.get('finishDate').value.month - 1, control.get('finishDate').value.day);
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
    const finishDate = new Date(control.get('finishDate').value.year,
        control.get('finishDate').value.month - 1, control.get('finishDate').value.day);

    if (startDate && finishDate && startDate.getMonth() !== finishDate.getMonth()) {
      return {'differentMonth': true};
    }

    return null;
  }
  deleteEvent(index: number) {
    this.generationEventList.splice(index, 1);
    this.toastr.success('Event deleted successfully.');
  }
  addEvent() {
    if (this.generateForm.valid) {
      const newEvent = this.returnEvent(this.generateForm);
      newEvent.startDate = new Date(this.generateForm.controls['startDate'].value.year,
          this.generateForm.controls['startDate'].value.month - 1,
          this.generateForm.controls['startDate'].value.day);
      newEvent.finishDate = new Date(this.generateForm.controls['finishDate'].value.year,
          this.generateForm.controls['finishDate'].value.month - 1,
          this.generateForm.controls['finishDate'].value.day);
      console.log('New Event', newEvent);
      for (const event of this.generationEventList) {
        console.log('Event', event);
        if (this.isOverlapping(newEvent, event)) {
          console.log('Event overlaps with an existing event.');
          this.toastr.error('Event overlaps with an existing event.');
          return;
        }
      }
      const clonedEvent = JSON.parse(JSON.stringify(newEvent));
      this.generationEventList.push(clonedEvent);
      this.toastr.success('Event added successfully.');
    } else {
      this.toastr.error('Form is not valid.');
    }
  }
  generateExcel() {
    console.log('Events being generated : ' + this.generationEventList);
    this.programService.generateExcel(this.programResponse.id, this.generationEventList).subscribe(
        response => {
          this.programResponse.hasCalendar = true;
          console.log('success generating');
          this.toastr.success('Excel generated successfully.');
        }, error => {
          if (error.error) {
            this.toastr.error(error.error, 'Error');
          } else {
            this.toastr.error('An error occurred', 'Error');
          }
        }
    );
  }
  downloadExcel() {
    this.programService.downloadExcel(this.programResponse.id).subscribe(
        response => {
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.programResponse.name + '.xlsx';
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
  closeModal() {
    this.close.emit();
  }
}
