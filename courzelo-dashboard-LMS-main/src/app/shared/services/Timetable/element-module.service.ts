import { Injectable } from '@angular/core';
import { ElementModule } from '../../models/Timetable/ElementModule';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GroupResponse} from '../../models/institution/GroupResponse';
import {UserResponse} from '../../models/user/UserResponse';
import {ClassRoomResponse} from '../../models/institution/ClassRoomResponse';

@Injectable({
  providedIn: 'root'
})
export class ElementModuleService {

  elementModules: ElementModule[] = [];
  private baseUrl = 'http://localhost:8080/api/elementModules';
  constructor(private http: HttpClient) {
  }

  public saveElementModule(elementModule: ElementModule): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}` + '/create', elementModule);
  }

  public getElementModuleByID(id: string): Observable<ElementModule> {
    return this.http.get<ElementModule>(`${this.baseUrl}/${id}`);
  }
  public getAllElementModules(): Observable<ElementModule[]> {
    console.log('ElementModules:', this.elementModules);
    return this.http.get<ElementModule[]>(this.baseUrl);
  }
  createElementModule(elementModule: ElementModule): Observable<ElementModule> {
    const url = `${this.baseUrl}/create`;
    return this.http.post<ElementModule>(url, elementModule);
  }

  public getElementModuleCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/count`);
  }

  public searchElementModules(name: string): Observable<ElementModule[]> {
    if (!name.trim()) {
      return new Observable<ElementModule[]>();
    }
    const encodedName = encodeURIComponent(name);
    const url = `${this.baseUrl}/search?name=${encodedName}`;
    return this.http.get<ElementModule[]>(url);
  }

  public deleteElementModule(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  public updateElementModule(elementModule: ElementModule): Observable<any> {
    return this.http.put<any>(this.baseUrl, elementModule);
  }

  public getEnums(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/enums`);
  }

 /* createElementModule(elementModuleData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, elementModuleData);
  }*/
  getGroups(): Observable<GroupResponse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/groups`);
  }
  getTeachers(): Observable<UserResponse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/teachers`);
  }
  getCourses(): Observable<ClassRoomResponse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/courses`);
  }
}
