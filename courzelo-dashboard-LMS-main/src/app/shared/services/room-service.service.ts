import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Room {
  id?: string;
  name: string;
  institutionID?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private baseUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  // Get all rooms for a specific institution
  getRooms(institutionID: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/institution/${institutionID}/allRoom`);
  }

  // Add a new room to a specific institution
  addRoom(institutionID: string, room: Room): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/institution/${institutionID}/add`, room);
  }

  // Delete a room by ID for a specific institution
  deleteRoom(institutionID: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/institution/${institutionID}/delete/${id}`);
  }
}
