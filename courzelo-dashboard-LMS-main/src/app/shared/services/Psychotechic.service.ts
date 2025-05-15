import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PsychotechnicTest } from '../models/PsychotechnicTest';
import { QuestionPsycho } from '../models/questionpsycho';

@Injectable({
  providedIn: 'root'
})
export class PsychotechnicTestsService {

  private apiUrl = 'http://157.173.196.161:31411/Psychotechnic';

  constructor(private http: HttpClient) {}

  getAllTests(): Observable<PsychotechnicTest[]> {
    return this.http.get<PsychotechnicTest[]>(`${this.apiUrl}/all`);
  }

  getTestsByBusiness(idBusiness: string): Observable<PsychotechnicTest[]> {
    return this.http.get<PsychotechnicTest[]>(`${this.apiUrl}/business/${idBusiness}`);
  }

  getTestById(id: string): Observable<PsychotechnicTest> {
    return this.http.get<PsychotechnicTest>(`${this.apiUrl}/${id}`);
  }

  addTest(test: PsychotechnicTest, idBusiness: string): Observable<PsychotechnicTest> {
    return this.http.post<PsychotechnicTest>(`${this.apiUrl}/${idBusiness}`, test);
  }

  updateTest(id: string, test: PsychotechnicTest): Observable<PsychotechnicTest> {
    return this.http.put<PsychotechnicTest>(`${this.apiUrl}/${id}`, test);
  }

  deleteTest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getQuestionsByTest(testId: string): Observable<QuestionPsycho[]> {
    return this.http.get<QuestionPsycho[]>(`${this.apiUrl}/Questions/${testId}`);
  }

  addQuestion(testId: string, question: QuestionPsycho): Observable<PsychotechnicTest> {
    return this.http.post<PsychotechnicTest>(`${this.apiUrl}/Questions/${testId}`, question);
  }

  updateQuestion(testId: string, questionId: number, question: QuestionPsycho): Observable<PsychotechnicTest> {
    return this.http.put<PsychotechnicTest>(`${this.apiUrl}/Questions/${testId}/${questionId}`, question);
  }

  deleteQuestion(testId: string, questionId: number): Observable<PsychotechnicTest> {
    return this.http.delete<PsychotechnicTest>(`${this.apiUrl}/Questions/${testId}/${questionId}`);
  }

  calculateScore(testId: string, test: PsychotechnicTest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/score/${testId}`, test);
  }
}
