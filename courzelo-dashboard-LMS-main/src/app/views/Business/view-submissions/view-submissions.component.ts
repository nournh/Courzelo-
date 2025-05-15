import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { ChallengeSubmission } from 'src/app/shared/models/ChallengeSubmission';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-view-submissions',
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent implements OnInit {
  challengeId!: string;
  submissions: ChallengeSubmission[] = [];
  filteredSubmissions: ChallengeSubmission[] = [];
  currentSubmission: ChallengeSubmission | null = null;
  searchTerm: string = '';
  loading = true;
  error = '';
  isAssigning = false;
  assignmentStatus: 'success' | 'error' | null = null;
  assignedCandidates: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.paramMap.get('challengeId') || '';
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    
    forkJoin([
      this.challengeService.getSubmissionsByChallengeId(this.challengeId),
      this.challengeService.getAssignedCandidates(this.challengeId)
    ]).subscribe({
      next: ([submissions, assignedCandidates]) => {
        this.submissions = this.normalizeSubmissions(submissions);
        this.filteredSubmissions = [...this.submissions];
        this.assignedCandidates = assignedCandidates;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load data';
        this.loading = false;
      }
    });
  }

  private normalizeSubmissions(data: any[]): ChallengeSubmission[] {
    return data.map(sub => ({
      ...sub,
      submittedAt: this.normalizeDate(sub.submittedAt),
      fileInfo: sub.answers?.fileInfo || null
    }));
  }

  private normalizeDate(dateData: any): string {
    if (!dateData) return 'N/A';
    if (Array.isArray(dateData)) {
      return new Date(
        dateData[0], // year
        dateData[1] - 1, // month (0-based in JS)
        dateData[2], // day
        dateData[3], // hour
        dateData[4], // min
        dateData[5], // sec
        Math.floor(dateData[6] / 1_000_000) // ms from nanoseconds
      ).toISOString();
    }
    return dateData;
  }

  filterSubmissions(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSubmissions = this.submissions.filter(sub =>
      sub.candidateEmail.toLowerCase().includes(term) 
     // (sub.fileInfo?.name && sub.fileInfo.name.toLowerCase().includes(term))
    );
  }

  selectSubmission(submission: ChallengeSubmission): void {
    this.currentSubmission = submission;
    this.assignmentStatus = null;
  }

  isAssigned(candidateEmail: string): boolean {
    return this.assignedCandidates.includes(candidateEmail);
  }

  assignCandidate(): void {
    if (!this.currentSubmission || this.isAssigned(this.currentSubmission.candidateEmail)) return;
    
    this.isAssigning = true;
    this.assignmentStatus = null;
    
    this.challengeService.assignCandidate(
      this.challengeId, 
      this.currentSubmission.candidateEmail
    ).subscribe({
      next: () => {
        this.assignmentStatus = 'success';
        this.assignedCandidates.push(this.currentSubmission!.candidateEmail);
        this.isAssigning = false;
      },
      error: (err) => {
        console.error(err);
        this.assignmentStatus = 'error';
        this.isAssigning = false;
      }
    });
  }

  getFileUrl(fileId: string): string {
    return `http://localhost:8080/api/challenges/files/${fileId}`;
  }

  previewFile(fileId: string): void {
    window.open(this.getFileUrl(fileId), '_blank');
  }

  downloadFile(fileId: string): void {
    const link = document.createElement('a');
    link.href = this.getFileUrl(fileId);
   // link.download = this.currentSubmission?.fileInfo?.name || 'submission';
    link.click();
  }

  getAnswerEntries(answers: any): {key: string, value: string}[] {
    if (!answers) return [];
    return Object.entries(answers)
      .filter(([key]) => key !== 'file' && key !== 'fileInfo')
      .map(([key, value]) => ({key, value: String(value)}));
  }

  isFileSubmission(sub: ChallengeSubmission): boolean {
    return !!sub.answers?.file;
  }
}