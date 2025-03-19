import { SessionStorageService } from 'src/app/shared/services/user/session-storage.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/shared/services/chatgroups/chat.service';
import Swal from 'sweetalert2';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit{

  groupForm: FormGroup = new FormGroup({});
connectedUser:UserResponse;
constructor(private chatservice:ChatService,
  private formBuilder:FormBuilder,
  private route:Router,
  private SessionStorageService:SessionStorageService,
  ){
}

ngOnInit(): void {
  this.createForm();
  this.connectedUser=this.SessionStorageService.getUserFromSession();
  }

  createForm() {
    this.groupForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }
  middle() {
    this.route.navigate(["/chatgroups/chat"])
    }
    onSubmit() {
      // Show confirmation dialog before submitting the form
      Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to create this group?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, create it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          // If the user confirms, submit the form
          this.chatservice.addgroup1(this.groupForm.value,this.connectedUser.email).subscribe(
            (res: any) => {
              console.log("done", res);
              // Show success message after form submission
              Swal.fire({
                title: 'Success!',
                text: 'Group has been created successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
              });
              this.route.navigate(["/chatgroups/chat"])
            },
            (error) => {
              // Handle errors during form submission
              console.error("Error", error);
              // Show error message if the submission fails
              Swal.fire({
                title: 'Error!',
                text: 'Failed to create the group. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          );
        }
      });
    }
    


}
