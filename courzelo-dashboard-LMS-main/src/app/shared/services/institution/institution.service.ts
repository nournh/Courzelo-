import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {PaginatedInstitutionsResponse} from '../../models/institution/PaginatedInstitutionsResponse';
import {Observable} from 'rxjs';
import {InstitutionRequest} from '../../models/institution/InstitutionRequest';
import {StatusMessageResponse} from '../../models/user/StatusMessageResponse';
import {InstitutionResponse} from '../../models/institution/InstitutionResponse';
import {PaginatedInstitutionUsersResponse} from '../../models/institution/PaginatedInstitutionUsersResponse';
import {InstitutionMapRequest} from '../../models/institution/InstitutionMapRequest';
import {map} from 'rxjs/operators';
import {GroupResponse} from '../../models/institution/GroupResponse';
import {UserEmailsRequest} from '../../models/institution/UserEmailsRequest';
import {InvitationsResultResponse} from '../../models/institution/InvitationsResultResponse';
import {SemesterRequest} from '../../models/institution/SemesterRequest';
import {TeacherResponse} from '../../models/institution/TeacherResponse';
import { TimetableResponse} from '../../models/institution/TimetableResponse';
import {InstitutionTimeSlot} from '../../models/institution/InstitutionTimeSlot';
import {InstitutionTimeSlotConfiguration} from '../../models/institution/InstitutionTimeSlotConfiguration';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {

  private baseUrl = 'http://localhost:8080/api/v1/institution';

  constructor(private http: HttpClient) { }

  getInstitutions(page: number = 0, sizePerPage: number = 10, keyword?: string): Observable<PaginatedInstitutionsResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('sizePerPage', sizePerPage.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<PaginatedInstitutionsResponse>(`${this.baseUrl}/all`, { params });
  }

  addInstitution(institutionRequest: InstitutionRequest): Observable<StatusMessageResponse> {
    return this.http.post<StatusMessageResponse>(`${this.baseUrl}/add`, institutionRequest);
  }
  getInstitutionStudents(institutionID: string) {
    return this.http.get(`${this.baseUrl}/${institutionID}/students`);
  }
  getInstitutionTeachers(institutionID: string) {
    return this.http.get(`${this.baseUrl}/${institutionID}/teachers`);
  }
  getInstitutionFilteredTeachers(institutionID: string, skills: string[]) {
    const params = new HttpParams()
        .set('skills', skills.join(','));
    return this.http.get<TeacherResponse[]>(`${this.baseUrl}/${institutionID}/filtered-teachers`, {params});
  }
  getInstitutionGroups(institutionID: string) {
    return this.http.get<GroupResponse[]>(`${this.baseUrl}/${institutionID}/groups`);
  }

  updateInstitution(institutionID: string, institutionRequest: InstitutionRequest) {
    return this.http.put(`${this.baseUrl}/update/${institutionID}`, institutionRequest);
  }

  deleteInstitution(institutionID: string): Observable<StatusMessageResponse> {
    return this.http.delete<StatusMessageResponse>(`${this.baseUrl}/delete/${institutionID}`);
  }
  inviteUsers(institutionID: string, emails: UserEmailsRequest, role: string, skills: string[]): Observable<InvitationsResultResponse> {
    const params = new HttpParams()
        .set('role', role)
        .set('skills', skills.join(','));
    return this.http.put<InvitationsResultResponse>(`${this.baseUrl}/${institutionID}/invite_users`, emails, { params });
  }
  updateSkills(institutionID: string, userEmail: string, skills: string[]) {
    const params = new HttpParams()
        .set('skills', skills.join(','));
    return this.http.put(`${this.baseUrl}/${institutionID}/${userEmail}/update-skills`, null, { params });
  }
  removeInstitutionUserRole(institutionID: string, email: string, role: string) {
    console.log(email, role, institutionID);
    const params = new HttpParams()
        .set('email', email)
        .set('role', role);
    return this.http.put(`${this.baseUrl}/${institutionID}/remove-user-role`, null, { params });
  }
  addInstitutionUserRole(institutionID: string, email: string, role: string) {
    console.log(email, role, institutionID);
    const params = new HttpParams()
        .set('email', email)
        .set('role', role);
    return this.http.put(`${this.baseUrl}/${institutionID}/add-user-role`, null, { params });
  }
  removeInstitutionUser(institutionID: string, email: string) {
    const params = new HttpParams()
        .set('email', email);
    return this.http.delete(`${this.baseUrl}/${institutionID}/remove-user`,  { params });
  }

  getInstitutionByID(institutionID: string): Observable<InstitutionResponse> {
    return this.http.get<InstitutionResponse>(`${this.baseUrl}/${institutionID}`);
  }
  getInstitutionUsers(institutionID: string, keyword?: string, role?: string, page: number = 0, sizePerPage: number = 10):
      Observable<PaginatedInstitutionUsersResponse> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('sizePerPage', sizePerPage.toString());

    if (role) {
      params = params.set('role', role);
    }
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<PaginatedInstitutionUsersResponse>(`${this.baseUrl}/${institutionID}/users`, { params });
  }
  setInstitutionMap(institutionID: string, institutionMapRequest: InstitutionMapRequest) {
    return this.http.put(`${this.baseUrl}/${institutionID}/set-map`, institutionMapRequest);
  }
  setSemester(institutionID: string, semesterRequest: SemesterRequest) {
    return this.http.put(`${this.baseUrl}/${institutionID}/set-semester`, semesterRequest);
  }
  clearSemester(institutionID: string) {
    return this.http.put(`${this.baseUrl}/${institutionID}/clear-semester`, null);
  }
  uploadImage(institutionID: string, image: File) {
    const formData = new FormData();
    formData.append('file', image);
    return this.http.post(`${this.baseUrl}/${institutionID}/image`, formData);
  }
  getImageBlobUrl(institutionID: string): Observable<Blob> {
    return this.getImage(institutionID).pipe(
        map((arrayBuffer: ArrayBuffer) => {
          return new Blob([arrayBuffer], {type: 'image/jpeg'});
        })
    );
  }
  getImage(institutionID: string): Observable<ArrayBuffer> {
    return this.http.get(`${this.baseUrl}/${institutionID}/image`, { responseType: 'arraybuffer'});
  }

    acceptInvite(code: string) {
        return this.http.put(`${this.baseUrl}/accept_invite/${code}`, null);
    }
  generateTimetable(institutionID: string) {
    return this.http.post(`${this.baseUrl}/${institutionID}/generate-timetable`, null);
  }
  getTimetable(institutionID: string) {
    return this.http.get<TimetableResponse>(`${this.baseUrl}/${institutionID}/timetable`);
  }
  updateTeacherDisponibility( teacherEmail: string, disponibilitySlots: InstitutionTimeSlot[]) {
    return this.http.put(`${this.baseUrl}/${teacherEmail}/update-teacher-disponibility`, disponibilitySlots);
  }
  updateInstitutionTimeSlots(institutionID: string, timeSlots: InstitutionTimeSlotConfiguration) {
    return this.http.put(`${this.baseUrl}/${institutionID}/update-timeslots`, timeSlots);
  }
  getInstitutionTimeSlots(institutionID: string): Observable<InstitutionTimeSlotConfiguration> {
    return this.http.get<InstitutionTimeSlotConfiguration>(`${this.baseUrl}/${institutionID}/timeslots`);
  }
}
