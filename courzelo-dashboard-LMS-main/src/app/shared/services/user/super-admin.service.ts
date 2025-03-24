import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PaginatedUsersResponse} from '../../models/user/PaginatedUsersResponse';
import {StatusMessageResponse} from '../../models/user/StatusMessageResponse';
import { UserResponse } from '../../models/user/UserResponse';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {

  private baseUrl = 'http://localhost:8080/api/v1/super-admin';

  constructor(private http: HttpClient) { }
  getUsers(page: number, size: number, keyword: string) {
    return this.http.get<PaginatedUsersResponse>(`${this.baseUrl}/users`, {params: {page: page, size: size, keyword: keyword}});
  }
  toggleBan(email: string) {
    return this.http.get<StatusMessageResponse>(`${this.baseUrl}/toggle-user-ban`, {params: {email: email}});
  }
  toggleEnable(email: string) {
    return this.http.get<StatusMessageResponse>(`${this.baseUrl}/toggle-user-enabled`, {params: {email: email}});
  }
  addRole(email: string, role: string) {
    return this.http.get<StatusMessageResponse>(`${this.baseUrl}/add-role`, {params: {email: email, role: role}});
  }
    removeRole(email: string, role: string) {
        return this.http.get<StatusMessageResponse>(`${this.baseUrl}/remove-role`, {params: {email: email, role: role}});
    }
    updateUser(id: string, user: UserResponse) {
      return this.http.put<StatusMessageResponse>(`${this.baseUrl}/update-user/${id}`, user);
    }
  
    deleteUser(id: string) {
      return this.http.delete<StatusMessageResponse>(`${this.baseUrl}/delete-user/${id}`);
    }
    getUserById(id: string): Observable<UserResponse> {
      return this.http.get<UserResponse>(`${this.baseUrl}/users/${id}`);
    }
    addUser(user: { email: string; name: string; role: string }) {
      return this.http.post(`${this.baseUrl}/users`, user);
    }
    uploadProfileImage(file: File, email: string) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email); // Ajout de l'email de l'utilisateur concerné
    
      return this.http.post<StatusMessageResponse>(`http://localhost:8080/api/v1/user/image`, formData);
    }
    
}
