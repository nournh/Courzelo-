import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ElementModule} from '../../models/Timetable/ElementModule';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  private baseUrl = 'http://localhost:8080/api/TimeTable';
  private apiUrl = 'http://localhost:8080/assignements';

  constructor(private http: HttpClient) {
  }

  public getEmplois(): Observable<ElementModule[]> {
    return this.http.get<ElementModule[]>(`${this.baseUrl}`);
  }
  getEmploiByProf(id: string) {
    return this.http.get<ElementModule[]>(`${this.baseUrl}` + '/prof' + id);
  }

  getEmploisByClasse(id: string | undefined) {
    return this.http.get<ElementModule[]>(`${this.baseUrl}` + id);
  }
  public importFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    console.log(formData.get('file'));
    return this.http.post(this.baseUrl + '/import', formData);
  }
  public exportFile(): Observable<Blob> {
    return this.http.get(this.baseUrl + '/classes', { responseType: 'blob' });
  }
  public generateEmploi(): Observable<any> {
    return this.http.get(this.baseUrl + '/generate');
  }
  public exportFileProf(id: string): Observable<Blob> {

    return this.http.get(this.baseUrl + '/teachers/' + id, { responseType: 'blob' });
  }
  public exportFileClasse(id: string | undefined): Observable<Blob> {
    return this.http.get(this.baseUrl + '/classes/' + id, { responseType: 'blob' });
  }
  public downloadGeneratedExcelFile(): Observable<Blob> {
    return this.http.get(this.baseUrl + '/download', { responseType: 'blob' });
  }
  assignTeachersToGroup(groupId: string, teacherIds: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${groupId}/assignTeachers`, teacherIds);
  }
  
}
