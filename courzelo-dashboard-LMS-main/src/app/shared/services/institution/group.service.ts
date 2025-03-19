import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupRequest } from '../../models/institution/GroupRequest';
import { GroupResponse } from '../../models/institution/GroupResponse';
import { PaginatedGroupsResponse } from '../../models/institution/PaginatedGroupsResponse';
import {UserResponse} from '../../models/user/UserResponse';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private baseUrl = 'http://localhost:8080/api/v1/group';

  constructor(private http: HttpClient) { }

  getGroup(groupID: string): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.baseUrl}/${groupID}`);
  }
  getMyGroup(): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.baseUrl}/myGroup`);
  }

  getGroupsByInstitution(institutionID: string, page: number, keyword: string, sizePerPage: number): Observable<PaginatedGroupsResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('sizePerPage', sizePerPage.toString());
    if (keyword != null) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<PaginatedGroupsResponse>(`${this.baseUrl}/groups/${institutionID}`, { params });
  }

  createGroup(groupRequest: GroupRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/create`, groupRequest);
  }

  updateGroup(groupID: string, groupRequest: GroupRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${groupID}/update`, groupRequest);
  }

  deleteGroup(groupID: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${groupID}/delete`);
  }

  addStudentToGroup(groupID: string, student: string): Observable<void> {
    const params = new HttpParams().set('student', student);
    return this.http.put<void>(`${this.baseUrl}/${groupID}/addStudent`, null, { params });
  }

  removeStudentFromGroup(groupID: string, student: string): Observable<void> {
    const params = new HttpParams().set('student', student);
    return this.http.put<void>(`${this.baseUrl}/${groupID}/removeStudent`, null, { params });
  }

  getAllClasses(): Observable<UserResponse> {
    return  this.http.get<UserResponse>(`${this.baseUrl}/all`);
  }
}
