import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateAppService {

  private baseUrl = 'http://localhost:8080/CandidateApp';

  constructor(private http: HttpClient) { }

  // Fetch all applications
  getAllApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  // Fetch applications by job
  getApplicationByJob(idJob: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/byJob/${idJob}`);
  }

  // Fetch applications by user
  getApplicationByUser(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/byUser/${userId}`);
  }

  // Fetch applications by business
  getApplicationByBusiness(idBusiness: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/business/${idBusiness}`);
  }

  // Fetch specific candidate application by ID
  getCandidateAppById(idCandidateApp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${idCandidateApp}`);
  }

  // Add a new application
  addApplication(idJob: string, idUser: string, appData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${idJob}/${idUser}`, appData);
  }

  // Upload CV for an application
  uploadCv(idCandidateApp: string, file: File): Observable<any> {
    const url = `${this.baseUrl}/uploadCv/${idCandidateApp}`;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(url, formData);
  }

  // Extract information from CV
  extractInfoFromCV(idCandidateApp: string, fileId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/extractInfo/${idCandidateApp}?fileId=${fileId}`, {});
  }

  // Match keywords between job and experience text
  matchKeywords(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/matchKeywords`, data);
  }

  // Download PDF (CV/Offer)
  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/downloadPdf/${id}`, { responseType: 'blob' });
  }

  // Add a state to a candidate application
  addApplicationState(idCandidateApp: string, state: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/State/${idCandidateApp}`, state);
  }

  // Check if an application exists
  checkApplicationExistence(idJob: string, id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/Exist/${idJob}/${id}`);
  }

  // Get current state of an application
  getCurrentState(idCandidateApp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/currentState/${idCandidateApp}`);
  }

  // Get keywords related to a job offer
  getJobOfferKeywords(idJob: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobOfferKeywords/${idJob}`);
  }
}