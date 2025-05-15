import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrehiringTests } from '../models/PrehiringTests';

@Injectable({
  providedIn: 'root'
})
export class PrehiringTestsService {

  private baseUrl = 'http://localhost:8080/PrehiringTests';

  constructor(private http: HttpClient) {}

  // Get all tests
  getAllTests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // Get tests by business ID
  getTestsByBusiness(idBusiness: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/business/${idBusiness}`);
  }

  // Get a single test by ID
  getTest(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Add a new test
  addTest(test: any, idBusiness: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${idBusiness}`, test);
  }

  // Update a test
  updateTest(id: string, test: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, test);
  }

  // Delete a test
  deleteTest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Get questions by test
  getQuestions(idPrehiringTest: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Questions/${idPrehiringTest}`);
  }

  // Add a question
  addQuestion(idPrehiringTest: string, question: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Questions/${idPrehiringTest}`, question);
  }

  // Update a question
  updateQuestion(idPrehiringTest: string, questionId: number, question: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Questions/${idPrehiringTest}/${questionId}`, question);
  }

  // Delete a question
  deleteQuestion(idPrehiringTest: string, questionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Questions/${idPrehiringTest}/${questionId}`);
  }

  // Calculate test score
  getTestScore(idPrehiringTest: string, test: any): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/score/${idPrehiringTest}`, test);
  }
   // Get tests by job ID
   getTestsByJob(jobId: string): Observable<PrehiringTests[]> {
    return this.http.get<PrehiringTests[]>(`${this.baseUrl}/tests/byJob/${jobId}`);
  }

}