import { forkJoin } from 'rxjs';
import { InscriptionService } from './../../../shared/services/admission/inscription.service';
import { Component, OnInit } from '@angular/core';
import { Interview } from 'src/app/shared/models/admission/Interview';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';
import { InterviewService } from 'src/app/shared/services/admission/interview.service';
import { SessionStorageService } from 'src/app/shared/services/user/session-storage.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleComponent } from '../../Admission/schedule/schedule.component';

@Component({
  selector: 'app-list-admission',
  templateUrl: './list-admission.component.html',
  styleUrls: ['./list-admission.component.scss']
})
export class ListAdmissionComponent implements OnInit{
connectedUser:UserResponse;
interviews:any[]=[];
interviewees: string[] = []; 
interview:any;
users:any[]=[];

constructor(private sessionsStorage:SessionStorageService,
 
  private interviewService:InterviewService,
  private InscriptionService:InscriptionService,
  public dialog: MatDialog
  ){
    this.connectedUser=sessionsStorage.getUserFromSession();
  }

ngOnInit(): void {
  this.Load();
}

Load() {
  this.interviewService.getInterviewByUser(this.connectedUser.email).subscribe((res) => {
    this.interviews=res;
    console.log(res);
    let allInterviewees: string[] = [];
    this.interviews.forEach(interview => {
      if (interview && interview.interviewee) {
        allInterviewees = allInterviewees.concat(interview.interviewee);
      }
    });
    // Remove duplicates by converting to a Set and then back to an array
    this.interviewees = Array.from(new Set(allInterviewees));
    console.log('Unique Interviewees:', this.interviewees);
    this.fetchInscriptionForInterviewees();
 // You can see all the collected admissions
  });
}

fetchInscriptionForInterviewees(): void {
  const emailRequests = this.interviewees.map((email: string) => {
    console.log("le email", email);
    return this.InscriptionService.getByUserEmail(email).pipe(
      map(res => res) // Adjust mapping if needed
    );
  });

  forkJoin(emailRequests).subscribe(
    (results) => {
      // Flatten the results if each response is an array
      this.users = ([] as any[]).concat.apply([], results);
      console.log("fetched", this.users);
    },
    (error) => {
      console.error("Error fetching users", error);
    }
  );
}

save(applicationId: any) {
  const inputElement = document.getElementById(`note${applicationId}`) as HTMLInputElement;
  const noteValue = inputElement ? parseFloat(inputElement.value) : null;

  if (noteValue !== null && noteValue >= 0 && noteValue <= 20) {
    console.log('Saved note:', noteValue, 'for application ID:', applicationId);
    
    // Call the updateNote method from your service
    this.InscriptionService.Note(applicationId.toString(), noteValue).subscribe(
      (res) => {
        console.log('Response from backend:', res);
        //this.ngOnInit();
        // Handle the successful response here
      },
      (error) => {
        console.error('Error updating note:', error);
        // Handle the error here
      }
    );
  } else {
    console.log('Invalid note value');
  }
}
update(){
  const dialogRef = this.dialog.open(ScheduleComponent,{
    width : "40%",
    height: "10%",
    data: { interviewees:this.interviewees}
  });
  dialogRef.afterClosed().subscribe(res =>{
   this.ngOnInit();
  })   
}
}
