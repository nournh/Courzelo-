import { InscriptionService } from './../../../shared/services/admission/inscription.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';
import { SessionStorageService } from 'src/app/shared/services/user/session-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.scss']
})
export class AcceptComponent implements OnInit{

  acceptForm!: FormGroup;
  connectedUser:UserResponse;


  constructor(public dialogRef: MatDialogRef<AcceptComponent>,
    private fb: FormBuilder,
    private sessionStorageService: SessionStorageService,
    private InscriptionService:InscriptionService,
      ){}
  ngOnInit(): void {
    this.connectedUser = this.sessionStorageService.getUserFromSession();
    this.createForm();
  }
  createForm() {
    this.acceptForm = this.fb.group({
      acceptedLimit: ['', [Validators.required]],
      waitingLimit: ['', [Validators.required]],
    });  
  }

  onSubmit(): void {
    const waitingLimit = this.acceptForm.get('waitingLimit')?.value;
    const acceptedLimit = this.acceptForm.get('acceptedLimit')?.value;
    const id = this.connectedUser.education.institutionID;
  
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to submit the form with these limits!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the submission
        this.InscriptionService.addInstitutionUserRole(id, acceptedLimit, waitingLimit).subscribe(
          (res) => {
            console.log(res);
            Swal.fire('Submitted!', 'Your form has been submitted.', 'success');
          },
          (error) => {
            console.error('Submission error:', error);
            Swal.fire('Failed!', 'There was an error submitting your form.', 'error');
          }
        );
  
        console.log("lol");
      } else {
        Swal.fire('Cancelled', 'Your form submission was cancelled.', 'info');
      }
    });
  }
  onClose(){
    this.dialogRef.close();
  }
}
