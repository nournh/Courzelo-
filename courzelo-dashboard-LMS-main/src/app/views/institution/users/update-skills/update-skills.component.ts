import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InstitutionUserResponse} from '../../../../shared/models/institution/InstitutionUserResponse';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {InstitutionService} from '../../../../shared/services/institution/institution.service';

@Component({
  selector: 'app-update-skills',
  templateUrl: './update-skills.component.html',
  styleUrls: ['./update-skills.component.scss']
})
export class UpdateSkillsComponent implements OnInit {
  skillsForm: FormGroup;
  @Input() teacher: InstitutionUserResponse;
  @Input() institutionID: string;
  @Output() teacherSkillsUpdated = new EventEmitter<InstitutionUserResponse>();
  constructor(
      private fb: FormBuilder,
      private institutionService: InstitutionService,
      private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.skillsForm = this.fb.group({
      skills: [this.teacher.skills || []]
    });
  }
 updateSkills() {
    if (this.skillsForm.valid) {
      this.teacher.skills = this.skillsForm.value.skills;
      this.institutionService.updateSkills(this.institutionID, this.teacher.email, this.teacher.skills).subscribe(() => {
        this.toastr.success('Skills updated successfully', 'Success');
        this.teacherSkillsUpdated.emit(this.teacher);
      }, error => {
        if (error.error) {
            this.toastr.error(error.error, 'Error');
        } else {
            this.toastr.error('An error occurred', 'Error');
        }
          }
      );
    }
 }
  closeUpdateSkillsModal() {
    this.teacherSkillsUpdated.emit();
  }
}
