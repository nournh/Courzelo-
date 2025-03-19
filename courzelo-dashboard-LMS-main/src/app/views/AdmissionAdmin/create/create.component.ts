import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionStorageService } from 'src/app/shared/services/user/session-storage.service';
import { InscriptionService } from './../../../shared/services/admission/inscription.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user/user.service';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

saveUser() {
throw new Error('Method not implemented.');
}
  inscriptionForm: FormGroup;
  connectedUser:UserResponse;
  countries = [];
  maxDate: NgbDateStruct;
  selectedFile: File | null = null;
  uploadMessage: string | null = null;

constructor(
  private inscriptionService:InscriptionService,
  private sessionStorageService: SessionStorageService,
  private formBuilder: FormBuilder,
  private userService: UserService


){}

ngOnInit(): void {
  this.createForm();
  this.connectedUser = this.sessionStorageService.getUserFromSession();
  this.userService.getCountries().subscribe(
    countries => {
      this.countries = countries;
      console.log(this.countries);
    }
);
}

onSubmit() {
  // Extract birthDate from form control and format it
  const birthDateControl = this.inscriptionForm.get('birthDate');
  const birthDate: NgbDateStruct | null = birthDateControl ? birthDateControl.value : null;

  let formattedDate: string | null = null;
  if (birthDate) {
    formattedDate = `${birthDate.year}-${birthDate.month.toString().padStart(2, '0')}-${birthDate.day.toString().padStart(2, '0')}`;
    console.log('Formatted Date:', formattedDate);
  }

  // Extract values from form controls
  const data = {
    institution: this.connectedUser.education.institutionID,
    birthDate: formattedDate, // or use new Date(formattedDate) if backend expects Date
    country: this.inscriptionForm.get('country')?.value,
    email: this.inscriptionForm.get('email')?.value,
    gender: this.inscriptionForm.get('gender')?.value,
    lastname: this.inscriptionForm.get('lastname')?.value,
    name: this.inscriptionForm.get('name')?.value,
    password: this.inscriptionForm.get('password')?.value
  };

  console.log('Data to be sent:', data);

  // Show confirmation dialog
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to submit this form?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, submit it!',
    cancelButtonText: 'No, cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // User confirmed, proceed with the form submission
      this.inscriptionService.create(data).subscribe(
        (res) => {
          console.log('Success:', res);
          Swal.fire({
            title: 'Success!',
            text: 'Your information has been submitted successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
        (err) => {
          console.error('Error:', err);
          Swal.fire({
            title: 'Error!',
            text: 'There was an issue submitting your information. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // User cancelled the action
      Swal.fire({
        title: 'Cancelled',
        text: 'Your form submission was cancelled.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  });
}


shouldShowError(controlName: string, errorName: string): boolean {
  const control = this.inscriptionForm.get(controlName);
  return control && control.errors && control.errors[errorName] && (control.dirty || control.touched);
}
createForm(){
this.inscriptionForm = this.formBuilder.group({
  email: ['', [Validators.required, Validators.email]],
  name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]],
  lastname: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]],
  birthDate: [[Validators.required]],
  gender: ['', [Validators.required]],
  country: ['', [Validators.required]],
  password: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(8)]],
});
}


onFileSelected(event: any): void {
  this.selectedFile = event.target.files[0];
}

onUpload(): void {
  if (this.selectedFile) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to upload the selected file!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, upload it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.inscriptionService.uploadFiles(this.selectedFile, this.connectedUser.education.institutionID).subscribe(
          response => {
            this.uploadMessage = 'Upload successful!';
            Swal.fire('Uploaded!', 'Your file has been uploaded.', 'success');
          },
          error => {
            console.error('Upload error:', error);
            this.uploadMessage = `Upload failed: ${error.message || error}`;
            Swal.fire('Failed!', 'There was an error uploading your file.', 'error');
          }
        );
      } else {
        Swal.fire('Cancelled', 'Your file upload was cancelled.', 'info');
      }
    });
  } else {
    this.uploadMessage = 'No file selected.';
    Swal.fire('Error!', 'Please select a file before uploading.', 'error');
  }
}

}
