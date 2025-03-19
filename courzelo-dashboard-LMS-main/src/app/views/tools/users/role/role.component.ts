import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent {
  @Input() role: string;
  getRoleIconClass(role: string): string {
    switch (role) {
      case 'student':
        return 'fas fa-user-graduate';
      case 'admin':
        return 'fas fa-user-shield';
      case 'superadmin':
        return 'fas fa-user-tie'; // Changed icon
      case 'teacher':
        return 'fas fa-chalkboard-teacher';
      default:
        return 'fas fa-user';
    }
  }
}
