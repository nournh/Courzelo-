import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotesDTO {
  idNotes?: string;
  note: string;
  remark: string;
  idCandidateApp: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = 'http://localhost:8080/api/notes';

  constructor(private http: HttpClient) { }

  addNotes(notesDTO: NotesDTO, idCandidateApp: string): Observable<NotesDTO> {
    return this.http.post<NotesDTO>(`${this.apiUrl}/${idCandidateApp}`, notesDTO);
  }

  updateNotes(idNotes: string, notesDTO: NotesDTO): Observable<NotesDTO> {
    return this.http.put<NotesDTO>(`${this.apiUrl}/${idNotes}`, notesDTO);
  }

  deleteNotes(idNotes: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idNotes}`);
  }

  getAllNotes(): Observable<NotesDTO[]> {
    return this.http.get<NotesDTO[]>(this.apiUrl);
  }

  getNotesByIdCandidateApp(idCandidateApp: string): Observable<NotesDTO[]> {
    return this.http.get<NotesDTO[]>(`${this.apiUrl}/candidate/${idCandidateApp}`);
  }
}