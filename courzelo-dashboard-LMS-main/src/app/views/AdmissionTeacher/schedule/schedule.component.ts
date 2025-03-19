import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit{

  id: any;

constructor(public dialogRef: MatDialogRef<ScheduleComponent>,
  @Optional() @Inject(MAT_DIALOG_DATA) public interviewees: any
  ) {this.id=interviewees.interviewees}
ngOnInit(): void {
  console.log(this.interviewees)
}
}
