import { Component, OnInit } from '@angular/core';
import { CandidateAppService } from 'src/app/shared/services/candidate-app.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-candidate-applications',
  templateUrl: './candidate-applications.component.html',
  styleUrls: ['./candidate-applications.component.scss']
})
export class CandidateApplicationsComponent implements OnInit {
  applications: any[] = [];
  isLoading = true;
  userId: string;

  // Status display configuration
  statusDisplay = {
    'PENDING': 'Under Review',
    'SCREENING': 'In Screening',
    'TEST_SENT': 'Test Sent',
    'TEST_COMPLETED': 'Test Completed',
    'INTERVIEW_SCHEDULED': 'Interview Scheduled',
    'INTERVIEW_COMPLETED': 'Interview Done',
    'SECOND_INTERVIEW': 'Second Interview',
    'OFFER_PENDING': 'Offer Pending',
    'OFFER_SENT': 'Offer Sent',
    'OFFER_ACCEPTED': 'Offer Accepted',
    'HIRED': 'Hired',
    'ONBOARDED': 'Onboarded',
    'REJECTED': 'Rejected',
    'ARCHIVED': 'Archived'
  };

  constructor(
    private candidateAppService: CandidateAppService,
    private authService: AuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user?.id;
      } catch (e) {
        console.error('Failed to parse user from sessionStorage', e);
        this.toastr.error('Session data is corrupted', 'Error');
        this.isLoading = false;
        return;
      }
    }
    
    if (!this.userId) {
      this.toastr.error('No user ID provided', 'Error');
      this.isLoading = false;
      return;
    }

    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.candidateAppService.getApplicationByUser(this.userId).subscribe({
      next: (res) => {
        this.applications = res.map(app => {
          // Find the interview state if it exists
          const interviewState = app.candidateState?.find(
            (state: any) => state.label === 'INTERVIEW_SCHEDULED'
          );
          
          return {
            ...app,
            currentState: app.candidateState?.[app.candidateState.length - 1] || { label: 'SUBMITTED' },
            interviewDetails: interviewState || null
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.toastr.error('Failed to load applications', 'Error');
        this.isLoading = false;
      }
    });
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

  getStatusDisplay(status: string): string {
    return this.statusDisplay[status] || status;
  }

  viewCV(cvId: string): void {
    if (!cvId) return;
    window.open(`http://localhost:8080/CandidateApp/viewPdf/${cvId}`, '_blank');
  }

  joinInterview(linkMeet: string): void {
    if (!linkMeet) {
      this.toastr.warning('No meeting link provided', 'Warning');
      return;
    }
    window.open(linkMeet, '_blank');
  }
}