import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GradeResponse} from '../../models/institution/GradeResponse';
import {GradeRequest} from '../../models/institution/GradeRequest';
import {MyGradesResponse} from "../../models/institution/MyGradesResponse";

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private baseUrl = 'http://localhost:8080/api/v1/grade';

  constructor(private http: HttpClient) { }

  getGradesByGroup(groupID: string): Observable<GradeResponse[]> {
    return this.http.get<GradeResponse[]>(`${this.baseUrl}/${groupID}`);
  }
  getMyGradesByGroup(): Observable<MyGradesResponse> {
    return this.http.get<MyGradesResponse>(`${this.baseUrl}/my`);
  }
  updateGradeValidity(groupID: string)  {
    return this.http.put(`${this.baseUrl}/${groupID}/update-validity`, null);
  }
  getGradesByGroupAndCourse(groupID: string, courseID: string): Observable<GradeResponse[]> {
    return this.http.get<GradeResponse[]>(`${this.baseUrl}/${groupID}/${courseID}`);
  }

  addGrade(gradeRequest: GradeRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/add`, gradeRequest);
  }
  addGrades(gradeRequests: GradeRequest[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/add-grades`, gradeRequests);
  }

  updateGrade(gradeID: string, gradeRequest: GradeRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${gradeID}/update`, gradeRequest);
  }

  deleteGrade(gradeID: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${gradeID}/delete`);
  }
}
