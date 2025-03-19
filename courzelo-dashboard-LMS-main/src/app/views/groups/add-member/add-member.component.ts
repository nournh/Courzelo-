import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/shared/services/chatgroups/chat.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit{
  id:any;
  memberForm:FormGroup= new FormGroup({});

  constructor(public dialogRef: MatDialogRef<AddMemberComponent>,private router : Router,
    private formBuilder: FormBuilder,private chatservice:ChatService, 
    @Optional() @Inject(MAT_DIALOG_DATA) public member: any
    ){this.id=member.member}
  ngOnInit(): void {
    console.log(this.id);
    this.createForm();
    this.memberForm.patchValue({
      id:this.id,
    })
    
  }

  createForm() {
    this.memberForm = this.formBuilder.group({
      id: [''],
      members: ['',Validators.required],
    });
  }

  onSubmit() {
    // Show confirmation dialog before proceeding with form submission
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to add this member?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, proceed with the API call
        console.log("form", this.memberForm.value);
        this.chatservice.addmember1(this.memberForm.value).subscribe(
          (res) => {
            console.log("done", res);
            // Show success message after successful submission
            Swal.fire({
              title: 'Success!',
              text: 'Member has been added successfully.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              // Close the form/modal after showing success alert
              this.onClose();
            });
          },
          (error) => {
            console.error("Error", error);
  
            // Show error message if the submission fails
            Swal.fire({
              title: 'Error!',
              text: 'Failed to add the member. Maybe he doesnt exist. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }
  

    onClose() {
      this.dialogRef.close();
    }
}
