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
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';

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
      
      // Charge d'abord les données depuis le localStorage
      const savedUsers = localStorage.getItem(`institution_${this.institutionID}_users`);
      if (savedUsers) {
        try {
          this.users = JSON.parse(savedUsers);
          this.totalItemsUsers = this.users.length;
          this._currentPageUsers = 1;
          this.totalPagesUsers = Math.ceil(this.totalItemsUsers / this.itemsPerPageUsers);
        } catch (e) {
          console.error('Error parsing saved users', e);
        }
      }
    
      // Charge les infos de l'institution
      this.institutionService.getInstitutionByID(this.institutionID).subscribe(
        response => {
          this.currentInstitution = response;
        }
      );
    
      // Si pas d'utilisateurs en cache, charge depuis l'API
      if (this.users.length === 0) {
        this.getInstitutionUsers(this.currentPageUsers, this.itemsPerPageUsers, null, null);
      }
    
      // Configuration de la recherche
      this.searchControlUsers.valueChanges
        .pipe(debounceTime(200))
        .subscribe(value => {
          // Pour les recherches, on utilise toujours l'API
          this.getInstitutionUsers(1, this.itemsPerPageUsers, value, null);
        });
    }
    private saveUsersToLocalStorage(): void {
      localStorage.setItem(`institution_${this.institutionID}_users`, JSON.stringify(this.users));
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
  /*removeInstitutionUser(user: InstitutionUserResponse) {
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
  }*/
  removeInstitutionUser(user: InstitutionUserResponse) {
    this.users = this.users.filter(u => u.email !== user.email);
    this.totalItemsUsers = this.users.length;
    this.saveUsersToLocalStorage(); // <-- N'oubliez pas cette ligne
    this.toastr.success('Utilisateur supprimé');
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

  exportUsersToCSV() {
    if (!this.users || this.users.length === 0) {
      this.toastr.warning('No users to export');
      return;
    }
  
    const csvRows = [];
    const headers = ['Full Name', 'Email', 'Roles', 'Country', 'Skills'];
    csvRows.push(headers.join(','));
  
    this.users.forEach(user => {
      const fullName = `${user.name || ''} ${user.lastname || ''}`.trim();
      const email = user.email || '';
      const roles = user.roles ? user.roles.join('|') : '';
      const country = user.country || '';
      const skills = user.skills ? user.skills.join('|') : '';
      const row = [fullName, email, roles, country, skills].map(val => `"${val}"`).join(',');
      csvRows.push(row);
    });
  
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log('Résultat du parsing CSV:', result);
  
        const newUsers = result.data
          .filter(row => row['Email'])
          .map(row => {
            const rawEmail = (row['Email'] || '').toString().trim();
            const email = rawEmail.replace(/[.,]$/, '');
  
            return {
              email: email,
              name: row['Full Name']?.split(' ')[0]?.trim() || '',
              lastname: row['Full Name']?.split(' ').slice(1).join(' ')?.trim() || '',
              roles: row['Roles'] ? [row['Roles'].toLowerCase()] : ['student'],
              country: row['Country']?.trim() || '',
              skills: row['Skills']?.split('|').map((s: string) => s.trim()) || [],
              disponibilitySlots: []
            };
          });
  
        const uniqueNewUsers = newUsers.filter(newUser =>
          !this.users.some(user => user.email === newUser.email)
        );
  
        this.users = [...this.users, ...uniqueNewUsers];
        this.totalItemsUsers = this.users.length;
  
        // 🎯 Appel automatique à inviteUser() avec les emails du fichier CSV
        const emailsFromCsv = uniqueNewUsers.map(u => u.email);
        if (emailsFromCsv.length > 0) {
          this.addUserForm.controls.studentsEmails.setValue(emailsFromCsv);
          this.addUserForm.controls.role.setValue('student'); // ou 'admin' si tu veux utiliser le rôle du CSV
          this.inviteUser(); // Appel à ta fonction
        }
  
        // 🔔 Notification
        Swal.fire({
          title: uniqueNewUsers.length > 0 ? 'Import réussi' : 'Aucun nouvel utilisateur',
          text: uniqueNewUsers.length > 0
            ? `${uniqueNewUsers.length} utilisateur(s) ajouté(s) à la liste`
            : 'Tous les utilisateurs existaient déjà',
          icon: uniqueNewUsers.length > 0 ? 'success' : 'info'
        });
  
        // Réinitialise le champ fichier
        event.target.value = '';
      },
      error: (err) => {
        Swal.fire('Erreur', 'Impossible de lire le fichier CSV: ' + err.message, 'error');
      }
    });
  }
  
  

}