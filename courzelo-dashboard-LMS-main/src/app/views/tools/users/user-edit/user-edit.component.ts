import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperAdminService } from 'src/app/shared/services/user/super-admin.service';
import { ResponseHandlerService } from 'src/app/shared/services/user/response-handler.service';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  user!: UserResponse;
  editForm!: FormGroup;
  availableRoles: string[] = ['Admin', 'User', 'Moderator'];
  genderOptions: string[] = ['Male', 'Female', 'Other']; // Example gender options
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private superAdminService: SuperAdminService,
    private handleResponse: ResponseHandlerService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.editForm = this.fb.group({
      name: [''],
      lastname: [''],
      birthDate: [''],
      gender: [''],
      country: [''],
      title: [''],
      bio: [''],
      email: [''],
      roles: [[]] // Ensure roles is always an array
    });

    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.superAdminService.getUserById(userId).subscribe(
        (user) => {
          console.log('User data received:', user); // Debugging
      
          this.user = user;
          this.isLoading = false;
      
          this.editForm.patchValue({
            name: user.profile?.name || '',
            lastname: user.profile?.lastname || '',
            birthDate: user.profile?.birthDate ? new Date(user.profile.birthDate).toISOString().split('T')[0] : '',
            gender: user.profile?.gender || '',
            country: user.profile?.country || '',
            title: user.profile?.title || '',
            bio: user.profile?.bio || '',
            email: user.email,
            roles: Array.isArray(user.roles) ? user.roles : [] // Ensure roles are an array
          });
        },
        (error) => {
          console.error('Error fetching user:', error);
          this.isLoading = false;
        }
      );
    }
  }

  updateUser() {
    if (!this.user || !this.user.id) {
        console.error("User ID is missing!");
        return;
    }

    console.log("Form values before update:", this.editForm.value); // 🔍 Vérifie ce que contient le formulaire

    const updatedUser = {
        ...this.user, // Conserve les autres données de l'utilisateur
        profile: {
            ...this.user.profile, // Conserve les autres données du profil
            name: this.editForm.value.name, 
            lastname: this.editForm.value.lastname,
            country: this.editForm.value.country,
            title: this.editForm.value.title,  // ✅ Ajoute le titre
            bio: this.editForm.value.bio  // ✅ Ajoute la bio
        },
        roles: Array.isArray(this.editForm.value.roles) ? this.editForm.value.roles : []
    };

    console.log("Sending update request:", updatedUser); // 🔍 Vérifie si les nouvelles valeurs sont bien là

    this.superAdminService.updateUser(this.user.id, updatedUser).subscribe(
        (res) => {
            console.log("User updated successfully:", res);
            this.router.navigate(['/tools/users']).then(() => window.location.reload());
        },
        (error) => {
            console.error("Error updating user:", error);
        }
    );
}

}
