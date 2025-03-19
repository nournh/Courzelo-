import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CourseResponse} from '../../../../shared/models/institution/CourseResponse';

@Component({
  selector: 'app-view-module-parts',
  templateUrl: './view-course-parts.component.html',
  styleUrls: ['./view-course-parts.component.scss']
})
export class ViewCoursePartsComponent implements OnInit{
  ngOnInit(): void {
    console.log(this.courseResponse);
  }
  @Input() courseResponse: CourseResponse;
  @Output() close = new EventEmitter<void>();
  onClose(): void {
    this.close.emit();
  }

  protected readonly Object = Object;
}
