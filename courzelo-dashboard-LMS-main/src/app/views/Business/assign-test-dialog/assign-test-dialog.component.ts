import { Component, OnInit } from '@angular/core';
import { JobOfferService } from 'src/app/shared/services/job-offer.service';
import { ActivatedRoute } from '@angular/router';
import { PrehiringTestsService } from 'src/app/shared/services/Prehiringtests.service';


@Component({
  selector: 'app-assign-test-dialog',
  templateUrl: './assign-test-dialog.component.html',
  styleUrls: ['./assign-test-dialog.component.scss']
})
export class AssignTestDialogComponent implements OnInit {
  jobId: string;
  userId = '';
  businessId = '';
  tests: string[] = [];
  availableTests: any[] = [];
  selectedTestIds: string[] = [];  // Array for multiple selected tests
  submitting = false;
  assignedTests: any[] = [];  // Holds the currently assigned tests
  isTestAssigned(testId: string): boolean {
    return this.assignedTests.some(t => t.idPrehiringTest === testId);
  }
  
  constructor(
    private jobOfferService: JobOfferService,
    private route: ActivatedRoute,
    private prehiringTestService: PrehiringTestsService
  ) {}

  ngOnInit(): void {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userId = user.id;
      this.businessId = user.business?.idBusiness || '';
    }

    this.jobId = this.route.snapshot.paramMap.get('idJob')!;
    this.fetchAvailableTests();
    this.loadAssignedTests();
  }
// In your component class
openDropdown(event: Event) {
  const select = event.target as HTMLSelectElement;
  select.size = select.multiple ? Math.min(select.options.length, 5) : 1;
  setTimeout(() => {
    select.size = 0;
  }, 200);
}
  // Fetch available prehiring tests from the service
  fetchAvailableTests() {
    this.prehiringTestService.getAllTests().subscribe({
      next: (tests) => {
        this.availableTests = tests;
      },
      error: (err) => console.error('Failed to fetch tests:', err)
    });
  }

  // Fetch assigned prehiring tests for the current job
  loadAssignedTests() {
    this.jobOfferService.getAssignedPrehiringTest(this.jobId).subscribe({
      next: (tests) => {
        this.assignedTests = tests;
      },
      error: () => {
        this.assignedTests = [];
      }
    });
  }

 // Handle assignment of selected tests to the job
assignPrehiringTest(): void {
  if (this.selectedTestIds.length === 0) return;

  this.submitting = true;
  this.jobOfferService.assignPrehiringTest(this.jobId, this.selectedTestIds).subscribe({
    next: () => {
      // Add selected tests to the assigned list
      this.selectedTestIds.forEach(testId => {
        const selectedTest = this.availableTests.find(test => test.idPrehiringTest === testId);
        if (selectedTest) {
          this.assignedTests.push(selectedTest);  // Add to the list of assigned tests
        }
      });
      this.selectedTestIds = [];  // Clear selection
    },
    error: (err) => {
      console.error('Error assigning tests:', err);
    },
    complete: () => {
      this.submitting = false;
    }
  });
}

}
