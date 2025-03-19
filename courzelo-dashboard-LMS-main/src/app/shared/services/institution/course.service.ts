import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CourseRequest} from '../../models/institution/CourseRequest';
import {PaginatedCoursesResponse} from '../../models/institution/PaginatedCoursesResponse';
import {CourseResponse} from '../../models/institution/CourseResponse';
import {AssessmentRequest} from '../../models/institution/AssessmentRequest';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private baseUrl = 'http://localhost:8080/api/v1/course';

  constructor(private http: HttpClient) { }

  createCourse(courseRequest: CourseRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/create`, courseRequest);
  }

  updateCourse(id: string, courseRequest: CourseRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, courseRequest);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCourses(page: number, sizePerPage: number, moduleID: string, keyword?: string): Observable<PaginatedCoursesResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('sizePerPage', sizePerPage.toString())
        .set('moduleID', moduleID)
        .set('keyword', keyword ? keyword : '');
    
    return this.http.get<PaginatedCoursesResponse>(`${this.baseUrl}/`, { params });
  }

  getCourse(id: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.baseUrl}/${id}`);
  }
  createAssessment(id: string, assessmentRequest: AssessmentRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/create-assessment`, assessmentRequest);
  }
  deleteAssessment(id: string, assessmentName: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/assessment/${assessmentName}`);
  }
  updateAssessment(id: string, assessmentRequest: AssessmentRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/update-assessment`, assessmentRequest);
  }
}
