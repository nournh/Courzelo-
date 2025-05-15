import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateAppService } from 'src/app/shared/services/candidate-app.service';
import { ToastrService } from 'ngx-toastr';
import { NotesService } from 'src/app/shared/services/notes.service';
import { NotesDTO } from 'src/app/shared/services/notes.service';
import { FormBuilder, FormGroup } from '@angular/forms';
interface ApplicationState {
  idCandidateState?: string;
  label: string;
  timestamp: string;
  changedBy?: string;
  notes?: string;
  score?: number;
  
  // Add other properties as needed
}
@Component({
  selector: 'app-view-applications-dialog',
  templateUrl: './view-applications-dialog.component.html',
  styleUrls: ['./view-applications-dialog.component.scss']
})

export class ViewApplicationsDialogComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  currentApp: any;
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  newNote: string = '';
  showNotes: boolean = false;
  showTestDetails: boolean = false;
  editingNoteId: string | null = null;
  editedNoteText: string = '';
  statusForm: FormGroup;
  selectedNewStatus: string = '';
  statusChangeNotes: string = '';
  interviewDateTime: string = '';
  meetingLink: string = '';
  showStatusChangeForm: boolean = false;
   
  // Enhanced status workflow
  statusWorkflow = {
    'PENDING': ['SCREENING', 'REJECTED'],
    'SCREENING': ['TEST_SENT', 'INTERVIEW_SCHEDULED', 'REJECTED'],
    'TEST_SENT': ['TEST_COMPLETED', 'TEST_EXPIRED', 'REJECTED'],
    'TEST_COMPLETED': ['INTERVIEW_SCHEDULED', 'REJECTED', 'SHORTLISTED'],
    'INTERVIEW_SCHEDULED': ['INTERVIEW_COMPLETED'],
    'INTERVIEW_COMPLETED': ['SECOND_INTERVIEW', 'OFFER_PENDING', 'REJECTED'],
    'SECOND_INTERVIEW': ['OFFER_PENDING', 'REJECTED'],
    'OFFER_PENDING': ['OFFER_SENT', 'OFFER_REJECTED'],
    'OFFER_SENT': ['OFFER_ACCEPTED', 'OFFER_DECLINED'],
    'OFFER_ACCEPTED': ['ONBOARDING', 'HIRED'],
    'HIRED': ['ONBOARDED', 'PROBATION'],
    'ONBOARDED': ['EMPLOYEE'],
    'REJECTED': ['ARCHIVED']
  };
 
 
  availableStatuses = Object.keys(this.statusWorkflow);

  constructor(
    private candidateAppService: CandidateAppService,
    private route: ActivatedRoute,
    private notesService: NotesService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.statusForm = this.fb.group({
      state: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const jobId = params['id'];
      console.log('Job ID from route params:', jobId); // Should NOT be undefined
        if (jobId) {
      this.loadApplicationsByJob(jobId);
    }
    });
  }
  onStatusChange(event: any): void {
    this.selectedNewStatus = event.target.value;
    // Reset interview fields when status changes
    this.interviewDateTime = '';
    this.meetingLink = '';
  }
  
  cancelStatusChange(): void {
    this.selectedNewStatus = '';
    this.statusChangeNotes = '';
    this.interviewDateTime = '';
    this.meetingLink = '';
  }
  
  confirmStatusChange(): void {
    if (!this.selectedNewStatus) {
      this.toastr.warning('Please select a status', 'Warning');
      return;
    }
  
    const newState: any = {
      label: this.selectedNewStatus,
      timestamp: new Date().toISOString(),
      changedBy: 'Recruiter',
      notes: this.statusChangeNotes || undefined
    };
  
    // Add interview details if applicable
    if (this.selectedNewStatus.includes('INTERVIEW')) {
      if (!this.interviewDateTime) {
        this.toastr.warning('Please select interview date and time', 'Warning');
        return;
      }
      
      newState.interviewDate = this.interviewDateTime;
      newState.linkMeet = this.meetingLink;
    }
  
    // For test-related statuses
    if (this.selectedNewStatus === 'TEST_SENT') {
      newState.idTest = prompt('Enter test ID:');
    }
  
    // For offer-related statuses
    if (this.selectedNewStatus === 'OFFER_SENT') {
      newState.offerDoc = prompt('Enter offer document reference:');
    }
  
    this.candidateAppService.addApplicationState(this.currentApp.idCandidateApp, newState)
      .subscribe({
        next: (updatedApp) => {
          this.currentApp = {
            ...updatedApp,
            currentState: updatedApp.candidateState[updatedApp.candidateState.length - 1]
          };
          
          // Update the applications list
          const index = this.applications.findIndex(app => 
            app.idCandidateApp === this.currentApp.idCandidateApp);
          if (index !== -1) {
            this.applications[index] = this.currentApp;
            this.filterApplications();
          }
          
          this.toastr.success(`Status updated to ${this.getStatusDisplay(this.selectedNewStatus)}`, 'Success');
          this.cancelStatusChange();
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.toastr.error('Failed to update status', 'Error');
        }
      });
  }

addNote(): void {
  if (!this.newNote.trim() || !this.currentApp) return;

  const newNoteDTO: NotesDTO = {
    note: this.newNote,
    remark: 'Recruiter note', // You can customize this
    idCandidateApp: this.currentApp.idCandidateApp
  };

  this.notesService.addNotes(newNoteDTO, this.currentApp.idCandidateApp).subscribe({
    next: (addedNote) => {
      if (!this.currentApp.notes) {
        this.currentApp.notes = [];
      }
      this.currentApp.notes.push(addedNote);
      this.newNote = '';
      this.toastr.success('Note added successfully', 'Success');
    },
    error: (err) => {
      console.error('Error adding note:', err);
      this.toastr.error('Failed to add note', 'Error');
    }
  });
}

// Start editing a note
startEditNote(note: any): void {
  this.editingNoteId = note.idNotes;
  this.editedNoteText = note.text;
}

// Update a note
updateNote(note: any): void {
  if (!this.editedNoteText.trim()) return;

  const updatedNoteDTO: NotesDTO = {
    idNotes: note.idNotes,
    note: this.editedNoteText,
    remark: note.remark || 'Updated note',
    idCandidateApp: this.currentApp.idCandidateApp
  };

  this.notesService.updateNotes(note.idNotes, updatedNoteDTO).subscribe({
    next: (updatedNote) => {
      const index = this.currentApp.notes.findIndex((n: any) => n.idNotes === updatedNote.idNotes);
      if (index !== -1) {
        this.currentApp.notes[index] = updatedNote;
      }
      this.cancelEditNote();
      this.toastr.success('Note updated successfully', 'Success');
    },
    error: (err) => {
      console.error('Error updating note:', err);
      this.toastr.error('Failed to update note', 'Error');
    }
  });
}

// Delete a note
deleteNote(noteId: string): void {
  if (confirm('Are you sure you want to delete this note?')) {
    this.notesService.deleteNotes(noteId).subscribe({
      next: () => {
        this.currentApp.notes = this.currentApp.notes.filter((note: any) => note.idNotes !== noteId);
        this.toastr.success('Note deleted successfully', 'Success');
      },
      error: (err) => {
        console.error('Error deleting note:', err);
        this.toastr.error('Failed to delete note', 'Error');
      }
    });
  }
}

// Cancel note editing
cancelEditNote(): void {
  this.editingNoteId = null;
  this.editedNoteText = '';
}


  loadApplicationsByJob(jobId: string): void {
    this.candidateAppService.getApplicationByJob(jobId).subscribe({
      next: (res: any[]) => {
        this.applications = res.map(app => ({
          ...app,
          currentState: app.candidateState?.[app.candidateState.length - 1] || { label: 'SUBMITTED' }
        }));
        console.log('Applications loaded from API:', res);

        this.filteredApplications = [...this.applications];
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.toastr.error('Failed to load applications', 'Error');
      }
    });
  }

  selectApplication(app: any): void {
    this.currentApp = app;
    this.showNotes = false;
    this.showTestDetails = false;
    
    // Load notes for the selected application
    this.notesService.getNotesByIdCandidateApp(app.idCandidateApp).subscribe({
      next: (notes) => {
        this.currentApp.notes = notes;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.currentApp.notes = [];
      }
    });
  }

  filterApplications(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredApplications = this.applications.filter(app => {
      const nameMatch = `${app.user?.profile?.name || ''} ${app.user?.profile?.lastName || ''}`
        .toLowerCase().includes(term);
      const statusMatch = this.statusFilter === 'ALL' || 
        app.currentState?.label === this.statusFilter;
      return nameMatch && statusMatch;
    });
  }

  updateApplicationStatus(newStatus: string): void {
    if (!this.currentApp || !newStatus) {
      this.toastr.warning('Please select a valid status', 'Warning');
      return;
    }
  
    const confirmChange = confirm(`Change status from ${this.currentApp.currentState.label} to ${newStatus}?`);
    if (!confirmChange) return;
  
    // Collect additional data based on status transition
    let additionalData: any = {};
    const notes = prompt('Enter notes about this change (optional):');
    
    // For interview-related statuses, collect interview details
    let interviewDate: string | null = null;
    let linkMeet: string | null = null;
    
    if (newStatus.includes('INTERVIEW')) {
      interviewDate = prompt('Enter interview date and time (YYYY-MM-DD HH:MM):');
      linkMeet = prompt('Enter meeting link (if remote):');
      
      additionalData.interviewDate = interviewDate;
      additionalData.linkMeet = linkMeet;
    }
  
    // For test-related statuses
    if (newStatus === 'TEST_SENT') {
      additionalData.idTest = prompt('Enter test ID:');
    }
  
    // For offer-related statuses
    if (newStatus === 'OFFER_SENT') {
      additionalData.offerDoc = prompt('Enter offer document reference:');
    }
  
    const newState: any = {
      label: newStatus,
      timestamp: new Date().toISOString(),
      changedBy: 'PROFESSIONAL',
      notes: notes || undefined,
      ...additionalData
    };
  
    this.candidateAppService.addApplicationState(this.currentApp.idCandidateApp, newState)
      .subscribe({
        next: (updatedApp) => {
          // Update the current application
          this.currentApp = {
            ...updatedApp,
            currentState: updatedApp.candidateState[updatedApp.candidateState.length - 1]
          };
          
          // Also update in the applications list
          const index = this.applications.findIndex(app => 
            app.idCandidateApp === this.currentApp.idCandidateApp);
          if (index !== -1) {
            this.applications[index] = this.currentApp;
            this.filterApplications();
          }
          
          this.toastr.success(`Status updated to ${newStatus}`, 'Success');
          
          // The email will be automatically sent by the backend
          // as implemented in the Java code
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.toastr.error('Failed to update status', 'Error');
        }
      });
  }
  // Update the getNextAvailableStatuses method
  getNextAvailableStatuses(): string[] {
    if (!this.currentApp?.currentState?.label) return [];
    
    // Get possible next states from workflow
    let nextStates = this.statusWorkflow[this.currentApp.currentState.label] || [];
    
    // Filter out current state if it's included
    return nextStates.filter(state => state !== this.currentApp.currentState.label);
  }

  openCVInNewTab(cvId: string): void {
    if (!cvId) return;
    const url = `http://localhost:8080/CandidateApp/viewPdf/${cvId}`;
    window.open(url, '_blank');
  }
  getStatusClass(status: string): string {
    const statusClasses: {[key: string]: string} = {
      'PENDING': 'bg-secondary',
      'SCREENING': 'bg-info',
      'TEST_SENT': 'bg-info text-dark',
      'TEST_COMPLETED': 'bg-primary text-white',
      'INTERVIEW_SCHEDULED': 'bg-primary text-white',
      'INTERVIEW_COMPLETED': 'bg-success text-white',
      'SECOND_INTERVIEW': 'bg-primary text-white',
      'OFFER_PENDING': 'bg-warning text-dark',
      'OFFER_SENT': 'bg-success text-white',
      'OFFER_ACCEPTED': 'bg-success text-white',
      'HIRED': 'bg-success text-white',
      'ONBOARDED': 'bg-success text-white',
      'REJECTED': 'bg-danger text-white',
      'ARCHIVED': 'bg-dark text-white'
    };
    return statusClasses[status] || 'bg-light text-dark';
  }

  // Test Score Methods
  getTestScore(): number | null {
    if (!this.currentApp) return null;
    
    if (this.currentApp.currentState?.score) {
      return this.currentApp.currentState.score;
    }
    
    const testState = this.currentApp.candidateState?.find((state: any) => state.score);
    return testState ? testState.score : null;
  }

  hasPrehiringTest(): boolean {
    return !!this.currentApp?.job?.idPrehiringTest;
  }

  toggleTestDetails(): void {
    this.showTestDetails = !this.showTestDetails;
  }

  getTestCompletionDate(): string {
    if (!this.currentApp) return '';
    
    if (this.currentApp.currentState?.score) {
      return this.currentApp.currentState.timestamp;
    }
    
    const testState = this.currentApp.candidateState?.find((state: any) => state.score);
    return testState ? testState.timestamp : '';
  }
  // In your component class
addCustomStatus(): void {
  const newStatus = prompt('Enter new status label:');
  if (!newStatus) return;

  // Check if status already exists
  if (this.availableStatuses.includes(newStatus.toUpperCase())) {
    this.toastr.warning('This status already exists', 'Warning');
    return;
  }

  // Add to available statuses
  this.availableStatuses.push(newStatus.toUpperCase());
  
  // Update status workflow (add as possible next status from current state)
  const currentStatus = this.currentApp.currentState?.label;
  if (currentStatus && this.statusWorkflow[currentStatus]) {
    this.statusWorkflow[currentStatus].push(newStatus.toUpperCase());
  }

  this.toastr.success('New status label added', 'Success');
}
 // Enhanced status display
 getStatusDisplay(status: string): string {
  const statusDisplay = {
    'PENDING': 'Pending Review',
    'SCREENING': 'Under Review',
    'TEST_SENT': 'Test Sent',
    'TEST_COMPLETED': 'Test Completed',
    'INTERVIEW_SCHEDULED': 'Interview Scheduled',
    'INTERVIEW_COMPLETED': 'Interview Completed',
    'SECOND_INTERVIEW': 'Second Interview',
    'OFFER_PENDING': 'Offer Pending',
    'OFFER_SENT': 'Offer Sent',
    'OFFER_ACCEPTED': 'Offer Accepted',
    'HIRED': 'Hired',
    'ONBOARDED': 'Onboarded',
    'REJECTED': 'Rejected',
    'ARCHIVED': 'Archived'
  };
  return statusDisplay[status] || status;
}

}