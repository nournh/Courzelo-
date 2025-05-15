import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ModuleRequest} from "../../models/institution/ModuleRequest";
import {ModuleResponse} from "../../models/institution/ModuleResponse";
import {PaginatedModuleResponse} from "../../models/institution/PaginatedModuleResponse";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private baseUrl = 'http://localhost:8080/api/v1/module';

  constructor(private http: HttpClient) { }

  createModule(moduleRequest: ModuleRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/create`, moduleRequest);
  }

  updateModule(id: string, moduleRequest: ModuleRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/update/${id}`, moduleRequest);
  }

  deleteModule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  getModuleById(id: string): Observable<ModuleResponse> {
    return this.http.get<ModuleResponse>(`${this.baseUrl}/get/${id}`);
  }

  getAllModules(programID: string, page: number = 0, size: number = 10, keyword: string = ''): Observable<PaginatedModuleResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('keyword', keyword);
    return this.http.get<PaginatedModuleResponse>(`${this.baseUrl}/get/all/program/${programID}`, { params });
  }

  getAllModulesByInstitution(institutionID: string, page: number = 0, size: number = 10, keyword: string = ''): Observable<PaginatedModuleResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('keyword', keyword);
    return this.http.get<PaginatedModuleResponse>(`${this.baseUrl}/get/all/institution/${institutionID}`, { params });
  }
}
