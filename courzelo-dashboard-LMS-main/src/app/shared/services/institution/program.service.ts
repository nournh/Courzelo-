import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {ProgramRequest} from '../../models/institution/ProgramRequest';
import {PaginatedProgramsResponse} from '../../models/institution/PaginatedProgramsResponse';
import {ProgramResponse} from '../../models/institution/ProgramResponse';
import {SimplifiedProgramResponse} from '../../models/institution/SimplifiedProgramResponse';
import {CalendarEventRequest} from "../../models/institution/CalendarEventRequest";
import { tap, map, catchError } from 'rxjs/operators'; // Ajoutez cette ligne


@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private baseUrl = 'http://localhost:8080/api/v1/program';

  constructor(private http: HttpClient) { }

  createProgram(programRequest: ProgramRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/create`, programRequest);
  }

  updateProgram(id: string, programRequest: ProgramRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, programRequest);
  }

  deleteProgram(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPrograms(page: number, sizePerPage: number, institutionID: string, keyword?: string): Observable<PaginatedProgramsResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('sizePerPage', sizePerPage.toString())
        .set('institutionID', institutionID);
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<PaginatedProgramsResponse>(`${this.baseUrl}/`, { params });
  }
  getSimplifiedPrograms(institutionID: string): Observable<SimplifiedProgramResponse[]> {
    const params = new HttpParams()
        .set('institutionID', institutionID);
    return this.http.get<SimplifiedProgramResponse[]>(`${this.baseUrl}/simplified`, { params });
  }
  getProgram(id: string): Observable<ProgramResponse> {
    return this.http.get<ProgramResponse>(`${this.baseUrl}/${id}`);
  }
  getProgramModuleCreditsSum(id: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${id}/module-credits-sum`);
  }
  getMyProgram(): Observable<ProgramResponse> {
    return this.http.get<ProgramResponse>(`${this.baseUrl}/myProgram`);
  }
  getSimplifiedProgram(id: string): Observable<SimplifiedProgramResponse> {
    return this.http.get<SimplifiedProgramResponse>(`${this.baseUrl}/simplified/${id}`);
  }
  generateExcel(programID: string, generation: CalendarEventRequest[]) {
    return this.http.post(`${this.baseUrl}/${programID}/generate-excel`, generation);
  }
  downloadExcel(programID: string) {
    return this.http.get(`${this.baseUrl}/${programID}/download-excel`, { responseType: 'blob' });
  }
  
  getProgramsForTeacher(page: number, sizePerPage: number, institutionID: string, keyword?: string) {
  let url = `${this.baseUrl}/teacher?page=${page}&sizePerPage=${sizePerPage}&institutionID=${institutionID}`;
  if (keyword) {
    url += `&keyword=${keyword}`;
  }
  return this.http.get<PaginatedProgramsResponse>(url);
}
getProgramsForStudent(page: number, sizePerPage: number, institutionID: string, keyword?: string): Observable<PaginatedProgramsResponse> {
  let url = `${this.baseUrl}/student?page=${page}&sizePerPage=${sizePerPage}&institutionID=${institutionID}`;
  if (keyword) {
    url += `&keyword=${keyword}`;
  }
  return this.http.get<PaginatedProgramsResponse>(url);
}
getProgramStats(programId: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/${programId}/stats`);
}

// Dans program.service.ts
getProgramProgress(programId: string): Observable<any> {
  console.log('Appel API avec programId:', programId); // Debug
  
  if (!programId || programId === 'undefined') {
    console.warn('ID invalide bloqué au niveau du service');
    return of(this.getEmptyStats());
  }

  return this.http.get<any>(`${this.baseUrl}/${programId}/progress`).pipe(
    tap(response => console.log('Réponse brute:', response)), // Debug
    catchError(error => {
      console.error('Détails erreur API:', {
        url: error.url,
        status: error.status,
        message: error.message
      });
      return of(this.getEmptyStats());
    })
  );
}
private getEmptyStats() {
  return {
    completedCourses: 0,
    totalCourses: 0,
    remainingCourses: 0,
    completionPercentage: 0,
    modules: [],
    isEmpty: true
  };
}


  
}