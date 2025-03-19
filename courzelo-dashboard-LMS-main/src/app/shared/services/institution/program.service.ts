import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ProgramRequest} from '../../models/institution/ProgramRequest';
import {PaginatedProgramsResponse} from '../../models/institution/PaginatedProgramsResponse';
import {ProgramResponse} from '../../models/institution/ProgramResponse';
import {SimplifiedProgramResponse} from '../../models/institution/SimplifiedProgramResponse';
import {CalendarEventRequest} from "../../models/institution/CalendarEventRequest";


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
}
