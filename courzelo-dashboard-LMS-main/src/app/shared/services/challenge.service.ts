import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChallengeRequestDTO } from '../models/ChallengeRequestDTO';
import { ChallengeSubmission } from '../models/ChallengeSubmission';

@Injectable({
  providedIn: 'root',
})
export class ChallengeService {
  private apiUrl = 'http://localhost:8080/api/challenges'; // adjust if needed

  constructor(private http: HttpClient) {}

  getAllChallenges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getChallengeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  submitChallengeText(id: string, payload: { email: string; answers: { [key: string]: string } }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/submit`, payload);
  }
  // Add this method to your ChallengeService
getSubmissionsForCandidate(challengeId: string, candidateEmail: string): Observable<ChallengeSubmission[]> {
  return this.http.get<ChallengeSubmission[]>(
    `${this.apiUrl}/${challengeId}/submissions/${candidateEmail}`
  );
}

  submitChallengeFile(id: string, email: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${id}/submit-file`, formData);
  }
  addChallenge(challenge: ChallengeRequestDTO, recruiterId: string) {
    return this.http.post(`${this.apiUrl}/add?recruiterId=${recruiterId}`, challenge);
  }_
  getSubmissionsByChallengeId(challengeId: string): Observable<ChallengeSubmission[]> {
    return this.http.get<ChallengeSubmission[]>(`${this.apiUrl}/${challengeId}/submissions`);
  }
  
    // Assign a candidate to a challenge
    assignCandidate(challengeId: string, candidateEmail: string): Observable<ChallengeRequestDTO> {
      return this.http.post<ChallengeRequestDTO>(
        `${this.apiUrl}/${challengeId}/assign-candidate`,
        null,
        {
          params: { candidateEmail }
        }
      );
    }

    // In your ChallengeService
getAssignedCandidates(challengeId: string): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/${challengeId}/assigned-candidates`);
}

// Add these methods to your ChallengeService

updateChallenge(id: string, challengeData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, challengeData);
}

deleteChallenge(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}