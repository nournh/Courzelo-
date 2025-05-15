import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateAppService } from 'src/app/shared/services/candidate-app.service';
import { CandidateApp } from 'src/app/shared/models/CandidateApp'; // your model
import { JobOffersDTO } from 'src/app/shared/models/JobOffers.model';
import { UserResponse } from 'src/app/shared/models/user/UserResponse'; // Assuming you have it

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.scss']
})
export class ApplyJobComponent implements OnInit {

  idJob!: string;
  idCandidate!: string;
  selectedFile!: File;
  application!: CandidateApp;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidateAppService: CandidateAppService
  ) { }

  ngOnInit(): void {
    this.idJob = this.route.snapshot.paramMap.get('idJob')!;
    this.idCandidate = this.route.snapshot.paramMap.get('idCandidate')!;

    console.log('Applying to Job:', this.idJob, 'Candidate:', this.idCandidate);

    // Initialize a basic empty application (will be populated)
    this.application = new CandidateApp(
      null,
      new Date(),
      [],
      '', // CV will be updated after upload
      [],
      null,
      {} as JobOffersDTO, // ✅ Correct initialization
      {} as UserResponse // Initialize an empty user or fetch if needed
    );
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  submitApplication(): void {
    if (!this.selectedFile) {
      alert('Please upload your CV first!');
      return;
    }

    this.candidateAppService.addApplication(this.idJob, this.idCandidate, this.application).subscribe({
      next: (response) => {
        const idCandidateApp = response.idCandidateApp;
        console.log('Application created with ID:', idCandidateApp);

        // Now upload the CV
        this.candidateAppService.uploadCv(idCandidateApp, this.selectedFile).subscribe({
          next: () => {
            alert('Application and CV uploaded successfully!');
            this.router.navigate(['/CandidateJob']); // Or wherever you want to redirect
          },
          error: (err) => {
            console.error('Error uploading CV:', err);
            alert('Failed to upload CV.');
          }
        });
      },
      error: (err) => {
        console.error('Error submitting application:', err);
        alert('Failed to submit application.');
      }
    });
  }

}
