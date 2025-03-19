import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PaginatedInvitationsResponse} from '../../models/institution/PaginatedInvitationsResponse';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private baseUrl = 'http://localhost:8080/api/v1/invitation';

  constructor(private http: HttpClient) { }
  resendInvitation(invitationID: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${invitationID}/resend`, {});
  }

  deleteInvitation(invitationID: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${invitationID}`);
  }

  getInvitations(page: number, sizePerPage: number, keyword: string | null, institutionID: string):
      Observable<PaginatedInvitationsResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('sizePerPage', sizePerPage.toString());
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<PaginatedInvitationsResponse>(`${this.baseUrl}/${institutionID}`, { params });
  }
}
