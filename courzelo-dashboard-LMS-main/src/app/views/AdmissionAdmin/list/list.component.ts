import { InterviewService } from 'src/app/shared/services/admission/interview.service';
import { SessionStorageService } from 'src/app/shared/services/user/session-storage.service';
import { InscriptionService } from './../../../shared/services/admission/inscription.service';
import { Component, OnInit } from '@angular/core';
import { UserResponse } from 'src/app/shared/models/user/UserResponse';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AdmissionREQ } from 'src/app/shared/models/admission/InterviewREQ';
import { AcceptComponent } from '../accept/accept.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit{
  connectedUser: UserResponse;
list:any[]=[];
Teachers: string[] = [];
students: string[] = [];
currentPage: number = 1;
itemsPerPage: number = 10;
totalItems: number = 0;
distribution: { teacher: string, students: string[] }[] = [];
  constructor(
    private InscriptionService:InscriptionService,
    private sessionStorageService:SessionStorageService,
    private interviewService:InterviewService,
    public dialog: MatDialog

  ){}

  ngOnInit(): void {
    this.connectedUser = this.sessionStorageService.getUserFromSession();
    this.loadData();
    this.isNoted();
  }
  loadData() {
    this.getTeachers();
    this.getStudents();
  }


  checkAndDistribute() {
    if (this.Teachers.length > 0 && this.students.length > 0) {
      this.distributeStudentsToTeachers();
    }
  }

  distributeStudentsToTeachers(): void {
    const numberOfTeachers = this.Teachers.length;
    const numberOfStudents = this.students.length;
  
    // If there are no teachers or students, handle it early
    if (numberOfTeachers === 0 || numberOfStudents === 0) {
      Swal.fire('Error!', 'No teachers or students available for distribution.', 'error');
      return;
    }
  
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to distribute ${numberOfStudents} students among ${numberOfTeachers} teachers.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, distribute!'
    }).then((result) => {
      if (result.isConfirmed) {
        const studentsPerTeacher = Math.floor(numberOfStudents / numberOfTeachers);
        let remainingStudents = numberOfStudents % numberOfTeachers;
  
        let studentIndex = 0;
        console.log("Teachers:", this.Teachers);
  
        // Clear the previous distribution if necessary
        this.distribution = [];
  
        this.Teachers.forEach((teacher, index) => {
          const numberOfStudentsForThisTeacher = studentsPerTeacher + (remainingStudents > 0 ? 1 : 0);
          this.distribution.push({
            teacher: teacher,
            students: this.students.slice(studentIndex, studentIndex + numberOfStudentsForThisTeacher)
          });
          studentIndex += numberOfStudentsForThisTeacher;
          remainingStudents--;
        });
  
        console.log("Distribution:", this.distribution);
  
        Swal.fire('Success!', 'Students have been successfully distributed.', 'success');
      } else {
        Swal.fire('Cancelled', 'The student distribution was cancelled.', 'info');
      }
    });
  }

  isNoted(){
    this.InscriptionService.isNoted(this.connectedUser.education.institutionID).subscribe((res)=>{
      console.log(res);
      console.log(typeof(res))
    })
  }

  getTeachers(): void {
    this.InscriptionService.getTeachers(this.connectedUser.education.institutionID).subscribe({
      next: (res) => {
        this.Teachers = res;
        console.log("Teachers array:", this.Teachers);
        this.checkAndDistribute();
      },
      error: (err) => {
        console.error("Error fetching teachers", err);
      }
    });
  }
  
  getStudents(): void {
    this.InscriptionService.getAllInscriptionsByInstitutions(this.connectedUser.education.institutionID).subscribe({
      next: (res) => {
        this.students = res.map(student => student.email); // Extract emails into students array
        this.list = res;
       // this.totalItems = this.students.length;
        console.log("Student array:", this.students);
        console.log("email array:", this.list);
        this.checkAndDistribute();
      },
      error: (err) => {
        console.error("Error fetching students", err);
      }
    });
  }

  createInterviews() {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to create interviews for all selected applications?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, create them!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show a loading spinner while processing
        Swal.fire({
          title: 'Processing...',
          text: 'Creating interviews, please wait.',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
  
        // Process each entry to create interviews
        const interviewRequests = this.distribution.map(entry => {
          // Sanitize the interviewer field to remove any extra quotes
          const sanitizedInterviewer = entry.teacher ? entry.teacher.replace(/['"]+/g, '').trim() : 'N/A';
  
          const interview: AdmissionREQ = {
            id: this.generateUniqueId(), // Generate a unique ID for each interview
            interviewer: sanitizedInterviewer, // Use sanitized interviewer
            interviewee: entry.students || [], // Default to empty array if null
            institution: this.connectedUser.education.institutionID // Assuming you have an admission ID to associate
          };
  
          // Debugging: Log interview details before sending
          console.log("Creating interview with details:", interview);
  
          // Ensure entry fields are properly populated
          if (!interview.interviewer) {
            console.error("Missing interviewer for entry:", entry);
          }
  
          return this.interviewService.create(interview);
        });
  
        forkJoin(interviewRequests).subscribe({
          next: (responses) => {
            console.log('Interviews created successfully:', responses);
            
            Swal.fire({
              title: 'Success!',
              text: 'All interviews have been created successfully.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
          error: (err) => {
            console.error('Error creating interviews:', err);
  
            Swal.fire({
              title: 'Error!',
              text: 'There was an error creating some interviews. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          },
          complete: () => {
            // Hide the loading spinner when the process is complete
            Swal.close();
          }
        });
      }
    });
  }
  
  
  // Utility method to generate unique ID
  generateUniqueId() {
    return 'xxxxxx'.replace(/[x]/g, () => (Math.random() * 36 | 0).toString(36));
  }
  
  onPageChange(page: number) {
    this.currentPage = page;
  }  

  update(){
    const dialogRef = this.dialog.open(AcceptComponent,{
      width : "40%",
      height: "10%",
      data: {}
    });
    dialogRef.afterClosed().subscribe(res =>{
     this.ngOnInit();
    })   
  }
}
