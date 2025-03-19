import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ClassRoomRequest} from '../../models/institution/ClassRoomRequest';
import {ClassRoomResponse} from '../../models/institution/ClassRoomResponse';
import {ClassRoomPostRequest} from '../../models/institution/ClassRoomPostRequest';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private baseUrl = 'http://localhost:8080/api/v1/classroom';

  constructor(private http: HttpClient) { }

  addClassroom(institutionID: string, courseRequest: ClassRoomRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${institutionID}/add`, courseRequest);
  }
  addProgramClassrooms(institutionID: string, semester: string, programID: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${institutionID}/${programID}/add`, null, { params: { semester } });
  }

  updateClassroom(courseID: string, courseRequest: ClassRoomRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${courseID}/update`, courseRequest);
  }

  deleteClassroom(courseID: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseID}/delete`);
  }

  getClassroom(classroomID: string): Observable<ClassRoomResponse> {
    return this.http.get<ClassRoomResponse>(`${this.baseUrl}/${classroomID}`);
  }
  getMyClassrooms(): Observable<ClassRoomResponse[]> {
    return this.http.get<ClassRoomResponse[]>(`${this.baseUrl}/myClassrooms`);
  }
  downloadFile(courseID: string, fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${courseID}/${fileName}/download`, { responseType: 'blob' });
  }
  setTeacher(courseID: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${courseID}/setTeacher`, null, { params: { email } });
  }

  addStudent(courseID: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${courseID}/addStudent`, null, { params: { email } });
  }

  removeStudent(courseID: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${courseID}/removeStudent`, null, { params: { email } });
  }

  leaveClassroom(courseID: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${courseID}/leave`, null);
  }

  addPost(courseID: string, coursePostRequest: ClassRoomPostRequest, files: File[]): Observable<void> {
    const formData: FormData = new FormData();
    // Append the coursePostRequest fields to the form data
    formData.append('title', coursePostRequest.title);
    formData.append('description', coursePostRequest.description);
    // Append each file to the form data
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }

    return this.http.put<void>(`${this.baseUrl}/${courseID}/addPost`, formData);
  }


  deletePost(courseID: string, postID: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseID}/deletePost`, { params: { postID } });
  }
}
