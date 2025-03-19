import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpParams, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  private baseURL = '/tk/api/replicas';
constructor(private http: HttpClient) { }

create(interview: any): Observable<any> {
  return this.http.post(`${this.baseURL}/add`, interview);
}
Note(id: any, note: any) {
  const body = { note };
  return this.http.post(`${this.baseURL}/note/${id}`,body);
}

addInstitutionUserRole(institutionID: string, acceptedLimit: any, waitingLimit: any) {
  console.log(acceptedLimit, waitingLimit, institutionID);
  const params = new HttpParams()
      .set('acceptedLimit', acceptedLimit)
      .set('waitingLimit', waitingLimit);
  return this.http.put(`${this.baseURL}/send-email/${institutionID}`, null, { params });
}
getByUserEmail(user: string): Observable<any> {
  return this.http.get<any>(`${this.baseURL}/email/${user}`);
}

getAllInscriptions(): Observable<any> {
  return this.http.get(`${this.baseURL}/all`);
}

isNoted(institutionID:any): Observable<any> {
  return this.http.get(`${this.baseURL}/institution/${institutionID}`);
}

getAllInscriptionsByInstitutions(id:any): Observable<any> {
  return this.http.get(`${this.baseURL}/all/${id}`);
}

getTeachers(id: string): Observable<any> {
  return this.http.get(`${this.baseURL}/teachers/${id}`);
}

uploadFiles(file: File, id: string): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Append id to form data
  formData.append('id', id);

  return this.http.post<string>(`${this.baseURL}/file/upload/${id}`, formData, {
    responseType: 'text' as 'json'  // Ensure the response type matches the backend
  });
}

uploadFile(file: File,id:any): Observable<any> {
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post(`${this.baseURL}/file/upload/${id}`, formData, {
    reportProgress: true,
    observe: 'events'
  }).pipe(
    // Handle different event types
    map((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          if (event.total) {
            const percentDone = Math.round(100 * event.loaded / event.total);
            return `File is ${percentDone}% uploaded.`;
          }
          return `File upload in progress...`;
        
        case HttpEventType.Response:
          return `File upload successful!`;
        
        default:
          return `Unhandled event: ${event.type}`;
      }
    }),
    catchError(this.handleError)
  );
}

private getEventMessage(event: HttpEvent<any>, formData: FormData): string {
  switch (event.type) {
    case HttpEventType.UploadProgress:
      return this.progressEvent(event);

    case HttpEventType.Response:
      return this.successEvent(event);

    default:
      return `Unhandled event: ${event.type}`;
  }
}
private progressEvent(event: HttpEvent<any>): string {
  if (event.type === HttpEventType.UploadProgress) {
    const progressEvent = event as HttpProgressEvent;  // Type guard to ensure it's an HttpProgressEvent
    if (progressEvent.total) {
      const percentDone = Math.round(100 * progressEvent.loaded / progressEvent.total);
      return `File is ${percentDone}% uploaded.`;
    }
    return `File upload in progress...`;
  }
  return `Not a progress event.`;
}
private successEvent(event: HttpResponse<any>): string {
  return `File upload successful!`;
}
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'Unknown error!';
  if (error.error instanceof ErrorEvent) {
    // Client-side or network error
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Backend error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  return throwError(errorMessage);
}
}
