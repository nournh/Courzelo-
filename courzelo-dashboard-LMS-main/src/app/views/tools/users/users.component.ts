import {Component, HostListener, OnInit} from '@angular/core';
import {SuperAdminService} from '../../../shared/services/user/super-admin.service';
import {PaginatedUsersResponse} from '../../../shared/models/user/PaginatedUsersResponse';
import {UserResponse} from '../../../shared/models/user/UserResponse';
import {ResponseHandlerService} from '../../../shared/services/user/response-handler.service';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-super-admin',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class Users implements OnInit {
  users: UserResponse[] = [];
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  loading = false;
  selectedRole = '';
  availableRoles: string[] = ['superadmin', 'admin', 'student', 'teacher'];
  searchControl: FormControl = new FormControl();
  editingUser: UserResponse | null = null;
  isAddUserModalOpen = false;
newUser = { email: '', name: '', role: '' };
  openAddUserModal() {
    this.isAddUserModalOpen = true;
  }
  closeAddUserModal() {
    this.isAddUserModalOpen = false;
  }
  
  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
    if (this.searchControl.value == null) {
      this.loadUsers(this._currentPage, this.itemsPerPage, '');
    } else {
        this.loadUsers(this._currentPage, this.itemsPerPage, this.searchControl.value);
    }
  }
  constructor(
      private superAdminService: SuperAdminService,
      private handleResponse: ResponseHandlerService
  ) { }

  ngOnInit() {
    this.loadUsers(this.currentPage, this.itemsPerPage, '');
      this.searchControl.valueChanges
          .pipe(debounceTime(200))
          .subscribe(value => {
            this.loadUsers(1, this.itemsPerPage, value);
          });

  }
  loadUsers(page: number, size: number, keyword: string) {
    this.loading = true;
    this.superAdminService.getUsers(page - 1, size, keyword).subscribe((response: PaginatedUsersResponse) => {
      console.log(response);
      // role to lowercase
        response.users.forEach(user => {
            user.roles = user.roles.map(role => role.toLowerCase());
        });
      this.users = response.users;
      this._currentPage = response.currentPage + 1;
      this.totalPages = response.totalPages;
      this.totalItems = response.totalItems;
      this.itemsPerPage = response.itemsPerPage;
      this.loading = false;
    }, error => {
      this.handleResponse.handleError(error);
        this.loading = false;
    }
    );
  }
  toggleBan(user: UserResponse) {
    this.superAdminService.toggleBan(user.email).subscribe(res => {
      user.security.ban = !user.security.ban;
      console.log(user);
      this.handleResponse.handleSuccess(res.message);
          this.loadUsers(this.currentPage, this.itemsPerPage, this.searchControl.value || '');
        }, error => {
      this.handleResponse.handleError(error);
    }
    );
  }
  toggleEnabled(user: UserResponse) {
    this.superAdminService.toggleEnable(user.email).subscribe(res => {
      user.security.enabled = !user.security.enabled;
          console.log(user);
          this.handleResponse.handleSuccess(res.message);
          this.loadUsers(this.currentPage, this.itemsPerPage, this.searchControl.value || '');

        }, error => {
      this.handleResponse.handleError(error);
    }
    );
  }

  changeUserRole(user: UserResponse) {
    if (this.selectedRole && !user.roles.includes(this.selectedRole)) {
      this.superAdminService.addRole(user.email, this.selectedRole.toUpperCase()).subscribe(res => {
        this.handleResponse.handleSuccess(res.message);
        user.roles.push(this.selectedRole.toLowerCase());
      }, error => {
        this.handleResponse.handleError(error);
      });
    } else if (this.selectedRole && user.roles.includes(this.selectedRole)) {
      this.superAdminService.removeRole(user.email, this.selectedRole.toUpperCase()).subscribe(res => {
        this.handleResponse.handleSuccess(res.message);
        user.roles = user.roles.filter(role => role !== this.selectedRole.toLowerCase());
      }, error => {
        this.handleResponse.handleError(error);
      });
    }
  }
  
  updateUser(user: UserResponse) {
    console.log('Updating user:', user); // Debugging
    if (!user.id) {
        console.error('User ID is missing!', user);
        return;
    }
    this.superAdminService.updateUser(user.id, user).subscribe(
        res => {
            console.log('User updated successfully:', res);
            this.handleResponse.handleSuccess(res.message);
        },
        error => {
            this.handleResponse.handleError(error);
        }
    );
}


  deleteUser(user: UserResponse) {
    if (confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      this.superAdminService.deleteUser(user.id).subscribe(
        res => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.handleResponse.handleSuccess(res.message);
        },
        error => this.handleResponse.handleError(error)
      );
    }
  }
  

  fetchAllUsers(): Promise<UserResponse[]> {
    let page = 0;
    const size = 100;  // Nombre d'utilisateurs par page (ajuste selon le besoin)
    let allUsers: UserResponse[] = [];
  
    const fetchPage = (page: number): Promise<UserResponse[]> => {
      return new Promise((resolve, reject) => {
        this.superAdminService.getUsers(page, size, '').subscribe((response: PaginatedUsersResponse) => {
          allUsers = [...allUsers, ...response.users];  // Ajouter les utilisateurs de cette page
          if (allUsers.length < response.totalItems) {
            resolve(fetchPage(page + 1));  // Passer à la page suivante si nécessaire
          } else {
            resolve(allUsers);  // Retourner tous les utilisateurs récupérés
          }
        }, (error) => {
          reject(error);  // Si erreur, rejeter la promesse
        });
      });
    };
  
    // Retourner la promesse qui résout tous les utilisateurs
    return fetchPage(page);
  }
  
  exportToExcel() {
    this.fetchAllUsers().then(allUsers => {
      if (!allUsers || allUsers.length === 0) {
        console.error("Aucun utilisateur à exporter.");
        return;
      }
  
      // Convertir les données en feuille Excel
      const worksheet = XLSX.utils.json_to_sheet(allUsers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');
  
      // Générer le fichier et l'enregistrer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'users.xlsx');
    }).catch(error => {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    });
  }
  addUser() {
    if (this.newUser.email && this.newUser.name && this.newUser.role) {
      this.superAdminService.addUser(this.newUser).subscribe(
        (res) => {
          this.handleResponse.handleSuccess('Utilisateur ajouté avec succès');
          this.loadUsers(this.currentPage, this.itemsPerPage, this.searchControl.value || '');
          this.closeAddUserModal();
        },
        (error) => {
          this.handleResponse.handleError(error);
        }
      );
    }
}}
