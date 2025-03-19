import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {GroupResponse} from '../../models/institution/GroupResponse';
import {CourseResponse} from '../../models/institution/CourseResponse';
import {UserService} from '../../services/user/user.service';

@Component({
  selector: 'app-view-students',
  templateUrl: './view-students.component.html',
  styleUrls: ['./view-students.component.scss']
})
export class ViewStudentsComponent implements OnInit {
  @Input() group: GroupResponse;
  @Output() close = new EventEmitter<void>();
  modules: CourseResponse[] = [];
  loading = false;
  studentsWithImages: { email: string, image: string }[] = [];
  constructor(
      private userService: UserService,
      private toastr: ToastrService
  ) {
  }
  ngOnInit(): void {
    if (this.group.students != null && this.group.students.length > 0) {
      this.loading = true;
      this.group.students.forEach(email => {
        this.userService.getProfileImageBlobUrl(email).subscribe(
            image => {
              const imageUrl = image ? URL.createObjectURL(image) : null;
              this.studentsWithImages.push({ email, image: imageUrl });
              this.loading = false;
            },
            error => {
              this.studentsWithImages.push({ email, image: null });
              this.loading = false;
            }
        );
      });
    }
  }
  onClose() {
    this.loading = false;
    this.close.emit();
  }
}
