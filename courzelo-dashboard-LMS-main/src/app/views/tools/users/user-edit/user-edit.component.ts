import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperAdminService } from 'src/app/shared/services/user/super-admin.service';
import { ResponseHandlerService } from 'src/app/shared/services/user/response-handler.service';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  user!: UserResponse;
  editForm!: FormGroup;
  availableRoles: string[] = ['Admin', 'User', 'Moderator'];
  genderOptions: string[] = ['Male', 'Female', 'Other']; // Gender options
  countries: string[] = ['USA', 'France', 'Germany', 'UK', 'Canada', 'Tunisia', 'Italy', 'Spain', 'India']; // Country list
  isLoading: boolean = true;
  selectedFile!: File;
imageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private superAdminService: SuperAdminService,
    private handleResponse: ResponseHandlerService,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      country: ['', Validators.required],
      title: [''],
      bio: [''],
      email: [ '', Validators.required], 
      roles: [[]],
    });
  
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.superAdminService.getUserById(userId).subscribe(
        (user) => {
          console.log('User data received:', user);
  
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
            roles: Array.isArray(user.roles) ? user.roles : []
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

    if (this.editForm.invalid) {
      console.error("Form is invalid!");
      return;
    }

    console.log("Form values before update:", this.editForm.value);

    const updatedUser = {
      ...this.user,
      profile: {
        ...this.user.profile,
        email: this.editForm.value.email,
        name: this.editForm.value.name, 
        lastname: this.editForm.value.lastname,
        birthDate: this.editForm.value.birthDate,
        gender: this.editForm.value.gender,
        country: this.editForm.value.country,
        title: this.editForm.value.title,
        bio: this.editForm.value.bio
      },
      roles: Array.isArray(this.editForm.value.roles) ? this.editForm.value.roles : []
    };

    console.log("Sending update request:", updatedUser);

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
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
  
      // Read the selected image file and display it immediately
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result; // Display the new image
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  
  uploadImage() {
    if (!this.selectedFile || !this.user || !this.user.email) {
      console.error('No file selected or user email missing');
      return;
    }
  
    this.superAdminService.uploadProfileImage(this.selectedFile, this.user.email).subscribe(
      (response) => {
        console.log('Image uploaded successfully:', response);
        alert('Image uploaded successfully');
        // Do not reset `imageUrl` to avoid loading the old image
      },
      (error) => {
        console.error('Error uploading image:', error);
      }
    );
  }
  
  
}
