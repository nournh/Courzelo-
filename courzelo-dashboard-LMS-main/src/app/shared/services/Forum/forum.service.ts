import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {ThreadResponse} from '../../models/Forum/ThreadResponse';
import {CreateThreadRequest} from '../../models/Forum/CreateThreadRequest';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private baseUrl = 'http://localhost:8080/api/v1/thread';

  constructor(private http: HttpClient) {}

  getInstitutionThread(institutionID: string): Observable<ThreadResponse[]> {
    return this.http.get<ThreadResponse[]>(`${this.baseUrl}/${institutionID}/all`);
  }

  addThread(createThreadRequest: CreateThreadRequest) {
    return this.http.post(`${this.baseUrl}/add`, createThreadRequest);
  }

  updateThread(threadID: string, createThreadRequest: CreateThreadRequest) {
    return this.http.post(`${this.baseUrl}/${threadID}/update`, createThreadRequest);
  }

  deleteThread(threadID: string) {
    return this.http.delete(`${this.baseUrl}/${threadID}/delete`);
  }
}
