import {Component, OnInit} from '@angular/core';
import {InstitutionUserResponse} from '../../../shared/models/institution/InstitutionUserResponse';
import {AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import {UserResponse} from '../../../shared/models/user/UserResponse';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {ResponseHandlerService} from '../../../shared/services/user/response-handler.service';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute} from '@angular/router';
import {UserEmailsRequest} from '../../../shared/models/institution/UserEmailsRequest';
import {TeacherTimeslotsComponent} from './teacher-timeslots/teacher-timeslots.component';
import {UpdateSkillsComponent} from "./update-skills/update-skills.component";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  get currentPageUsers(): number {
    return this._currentPageUsers;
  }
  set currentPageUsers(value: number) {
    this._currentPageUsers = value;
    if (this.searchControlUsers.value == null) {
      this.getInstitutionUsers(this._currentPageUsers, this.itemsPerPageUsers, null, null);
    } else {
      this.getInstitutionUsers(this._currentPageUsers, this.itemsPerPageUsers, this.searchControlUsers.value, null);
    }
  }
  constructor(
      private institutionService: InstitutionService,
      private handleResponse: ResponseHandlerService,
      private formBuilder: FormBuilder,
      private toastr: ToastrService,
      private route: ActivatedRoute,
      private modalService: NgbModal
  ) { }
  currentUser: InstitutionUserResponse;
    institutionID;
    currentInstitution: InstitutionResponse;
  searchControlUsers: FormControl = new FormControl();
  users: InstitutionUserResponse[] = [];
  emailRequest: UserEmailsRequest;
  _currentPageUsers = 1;
  totalPagesUsers = 0;
  totalItemsUsers = 0;
  itemsPerPageUsers = 10;
  loadingUsers = false;
  roles = ['Admin', 'Teacher', 'Student'];
  addUserForm = this.formBuilder.group({
        studentsEmails: [[], Validators.required],
        role: ['', [Validators.required]],
      }
  );
  selectedRole = '';
  availableRoles: string[] = ['admin', 'student', 'teacher'];
     pasteSplitPattern = /[\s,;]+/;
  ngOnInit() {
    this.institutionID = this.route.snapshot.paramMap.get('institutionID');
    this.institutionService.getInstitutionByID(this.institutionID).subscribe(
        response => {
          this.currentInstitution = response;
        }
    );
    this.getInstitutionUsers(this.currentPageUsers, this.itemsPerPageUsers, null, null);
    this.searchControlUsers.valueChanges
        .pipe(debounceTime(200))
        .subscribe(value => {
          this.getInstitutionUsers(1, this.itemsPerPageUsers, value, null);
        });
  }
    public onSelect(item) {
        console.log('tag selected: value is ' + item);
        console.log('students emails: ' + this.addUserForm.get('studentsEmails').value);
    }
    emailValidator: ValidatorFn = (control: AbstractControl) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = emailPattern.test(control.value);
        return isValid ? null : { 'invalidEmail': true };
    }
  shouldShowError(controlName: string, errorName: string): boolean {
    const control = this.addUserForm.get(controlName);
    return control && control.errors && control.errors[errorName] && (control.dirty || control.touched);
  }
  inviteUser() {
    this.loadingUsers = true;
    if (this.addUserForm.valid) {
        this.emailRequest = {
            emails: this.addUserForm.controls.studentsEmails.value
        };
        console.log(this.emailRequest);
      this.institutionService.inviteUsers(this.institutionID, this.emailRequest,
          this.addUserForm.controls.role.value.toUpperCase(), []).subscribe(
          response => {
              console.log(response);
              console.log('lengths',
                  this.emailRequest.emails.length,
                  response.emailsAlreadyAccepted.length,
                  response.emailsNotFound.length);
              if (this.emailRequest.emails.length !== response.emailsNotFound.length + response.emailsAlreadyAccepted.length) {
                  this.toastr.success('Users invited successfully');
              }
              if (response.emailsAlreadyAccepted.length > 0) {
                  this.toastr.warning('Some users have already accepted an invitation : ' + response.emailsAlreadyAccepted.join(', '), '', {
                      timeOut: 15000 // 15 seconds
                  });
              }
              if (response.emailsNotFound.length > 0) {
                  this.toastr.warning('Some users were not found : ' + response.emailsNotFound.join(', '), '', {
                      timeOut: 15000 // 15 seconds
                  });
              }
            this.addUserForm.reset();
            this.getInstitutionUsers(this.currentPageUsers, this.itemsPerPageUsers, null, null);
            this.loadingUsers = false;
          }, error => {
                 if (error.error) {
                  this.toastr.error(error.error);
              } else {
                  this.toastr.error('Failed to invite users');
              }
              this.loadingUsers = false;
          }
      );
    } else {
      this.toastr.error('Please fill all fields correctly');
      this.loadingUsers = false;
    }
  }
  addUserModel(content) {
    this.modalService.open(content, { ariaLabelledBy: 'Invite user' , backdrop: false})
        .result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
  getInstitutionUsers(page: number, size: number, keyword: string, role: string) {
    this.loadingUsers = true;
    this.institutionService.getInstitutionUsers(this.institutionID, keyword, role, page - 1, size).subscribe(
        response => {
          console.log(response);
          response.users.forEach(user => {
            user.roles = user.roles.map(role1 => role1.toLowerCase());
          });
          this.users = response.users;
          this._currentPageUsers = response.currentPage + 1;
          this.totalPagesUsers = response.totalPages;
          this.totalItemsUsers = response.totalItems;
          this.itemsPerPageUsers = response.itemsPerPage;
          this.loadingUsers = false;
        }, error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Failed to fetch users');
            }
            this.loadingUsers = false;
        }
    );
  }
    openTeacherTimeslotsModal(teacher: InstitutionUserResponse) {
        const modalRef = this.modalService.open(TeacherTimeslotsComponent, { backdrop: false });
        modalRef.componentInstance.teacher = teacher;
        modalRef.componentInstance.institutionID = this.institutionID;
        modalRef.componentInstance.slotsUpdated.subscribe((slots) => {
            teacher.disponibilitySlots = slots;
            modalRef.close();
        }, error => {
                if (error.error) {
                    this.toastr.error(error.error);
                } else {
                    this.toastr.error('An error occurred while updating teacher disponibility');
                }
                modalRef.close();
            }
        );
    }
    openUpdateSkillsModal(teacher: InstitutionUserResponse) {
        const modalRef = this.modalService.open(UpdateSkillsComponent, { backdrop: false });
        modalRef.componentInstance.teacher = teacher;
        modalRef.componentInstance.institutionID = this.institutionID;
        modalRef.componentInstance.teacherSkillsUpdated.subscribe((updatedTeacher) => {
                teacher = updatedTeacher;
                modalRef.close();
            }, error => {
                if (error.error) {
                    this.toastr.error(error.error);
                } else {
                    this.toastr.error('An error occurred while updating teacher skills');
                }
                modalRef.close();
            }
        );
    }
  removeInstitutionUser(user: InstitutionUserResponse) {
    this.loadingUsers = true;
    this.institutionService.removeInstitutionUser(this.institutionID, user.email).subscribe(
        response => {
          this.toastr.success('User removed successfully');
          this.getInstitutionUsers(this.currentPageUsers, this.itemsPerPageUsers, null, null);
          this.loadingUsers = false;
        }, error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Failed to remove user');
            }
            this.loadingUsers = false;
        }
    );
  }
  modalConfirmUserFunction(content: any, user: InstitutionUserResponse) {
    this.currentUser = user;
    this.modalService.open(content, { ariaLabelledBy: 'confirm User', backdrop: false })
        .result.then((result) => {
      if (result === 'Ok') {
        this.removeInstitutionUser(user);
      }
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
  changeUserRole(user: UserResponse) {
    this.loadingUsers = true;
    if (this.selectedRole && !user.roles.includes(this.selectedRole)) {
      this.institutionService.addInstitutionUserRole(this.institutionID, user.email, this.selectedRole.toUpperCase()).subscribe(res => {
        this.toastr.success('User role updated successfully');
        user.roles.push(this.selectedRole);
        this.loadingUsers = false;
      }, error => {
          if (error.error) {
              this.toastr.error(error.error);
          } else {
              this.toastr.error('Failed to update user role');
          }
          this.loadingUsers = false;
      });
    } else if (this.selectedRole && user.roles.includes(this.selectedRole)) {
      this.institutionService.removeInstitutionUserRole(this.institutionID, user.email, this.selectedRole.toUpperCase()).subscribe(res => {
        this.toastr.success('User role updated successfully');
        user.roles = user.roles.filter(role => role !== this.selectedRole);
        this.loadingUsers = false;
      }, error => {
        if (error.error) {
            this.toastr.error(error.error);
        } else {
            this.toastr.error('Failed to update user role');
        }
        this.loadingUsers = false;
      });
    } else {
        this.toastr.error('Please select a role');
        this.loadingUsers = false;
    }
  }
}
