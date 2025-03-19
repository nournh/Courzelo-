import {Component, Input, OnInit} from '@angular/core';
import {Timeslot, TimetableResponse} from '../../models/institution/TimetableResponse';
import {InstitutionTimeSlot} from '../../models/institution/InstitutionTimeSlot';

@Component({
  selector: 'app-view-timetable',
  templateUrl: './view-timetable.component.html',
  styleUrls: ['./view-timetable.component.scss']
})
export class ViewTimetableComponent implements OnInit {
@Input() group: { [key: string]: Timeslot[] };
@Input() teacher: { [key: string]: Timeslot[] };
@Input() timetableWeek: Date;
@Input() timeTableSlots: InstitutionTimeSlot[];
  groupKey: string;
  teacherKey: string;
  timeslots: Timeslot[];
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Time slots corresponding to the timetable
  timeSlots = [
    { startTime: '09:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '13:00' },
    { startTime: '13:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '17:00' },

  ];

  // Helper to get object keys (same as used in the parent component)
  objectKeys = Object.keys;

  ngOnInit() {
    if (this.group) {
      this.groupKey = Object.keys(this.group)[0];
    }
    if (this.teacher) {
      this.teacherKey = Object.keys(this.teacher)[0];
    }
  }
// In your component TypeScript file
  getGridTemplateRows(): string {
    return `repeat(${this.timeTableSlots.length}, 1fr)`;
  }
  // Check if there's a Timeslot for the given day and time
  hasTimeslot(day: string, time: { startTime: string, endTime: string }): boolean {
    const groupKey = this.objectKeys(this.group)[0];
    return this.group![groupKey].some(slot =>
        slot.dayOfWeek.toLowerCase() === day.toLowerCase() &&
        slot.startTime === time.startTime &&
        slot.endTime === time.endTime
    );
  }
  hasTimeslotTeacher(day: string, time: { startTime: string, endTime: string }): boolean {
    const teacherKey = this.objectKeys(this.teacher)[0];
    return this.teacher![teacherKey].some(slot =>
        slot.dayOfWeek.toLowerCase() === day.toLowerCase() &&
        slot.startTime === time.startTime &&
        slot.endTime === time.endTime
    );
  }

  // Get the timeslot info for the given day and time
  getTimeslotInfo(day: string, time: { startTime: string, endTime: string }): Timeslot {
    const groupKey = this.objectKeys(this.group)[0];
    return this.group![groupKey].find(slot =>
        slot.dayOfWeek.toLowerCase() === day.toLowerCase() &&
        slot.startTime === time.startTime &&
        slot.endTime === time.endTime
    )!;
  }
  getTimeslotInfoTeacher(day: string, time: { startTime: string, endTime: string }): Timeslot {
    const teacherKey = this.objectKeys(this.teacher)[0];
    return this.teacher![teacherKey].find(slot =>
        slot.dayOfWeek.toLowerCase() === day.toLowerCase() &&
        slot.startTime === time.startTime &&
        slot.endTime === time.endTime
    )!;
  }

  // Return the CSS class based on the subject (or any other logic you want)
  getTimeslotClass(day: string, time: { startTime: string, endTime: string }): string {
    const timeslot = this.getTimeslotInfo(day, time);
    if (timeslot.module === 'Eng') {
      return 'accent-orange-gradient';
    } else if (timeslot.module === 'Mat') {
      return 'accent-green-gradient';
    } else if (timeslot.module === 'Phy') {
      return 'accent-cyan-gradient';
    }
    // Default class if no specific module matches
    return 'accent-default';
  }
  getTimeslotClassTeacher(day: string, time: { startTime: string, endTime: string }): string {
    const timeslot = this.getTimeslotInfoTeacher(day, time);
    if (timeslot.module === 'Eng') {
      return 'accent-orange-gradient';
    } else if (timeslot.module === 'Mat') {
      return 'accent-green-gradient';
    } else if (timeslot.module === 'Phy') {
      return 'accent-cyan-gradient';
    }
    // Default class if no specific module matches
    return 'accent-default';
  }
}
