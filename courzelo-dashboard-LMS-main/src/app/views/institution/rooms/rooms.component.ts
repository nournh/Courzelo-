import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import { Room, RoomService } from 'src/app/shared/services/room-service.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit{
rooms: Room[] = [];
  newRoomName: string = '';
    constructor(private roomService: RoomService,
      private route: ActivatedRoute  ) {
       
    }
   
    institutionID: string;
    currentInstitution: InstitutionResponse;
    
    
  ngOnInit() {
     this.route.paramMap.subscribe(params => {
      this.institutionID = params.get('institutionID') || ''; // Ensure institutionID is available
      if (this.institutionID) {
        this.loadRooms();  // Load rooms when institutionID is available
      } else {
        console.error('Institution ID is not available');
      }
    });
      
      ;

      
  }
  
   
    loadRooms(): void {
        
   this.roomService.getRooms(this.institutionID).subscribe
(
      (data) => {
        this.rooms = data;
      },
      (error) => {
        console.error('Error loading rooms', error);
      }
    );
  }

  // Add a new room
  addRoom(): void {
    if (this.newRoomName.trim() !== '') { // Ensure name is not empty
      const newRoom: Room = { name: this.newRoomName, institutionID: this.institutionID };
      this.roomService.addRoom(this.institutionID, newRoom).subscribe(
        () => {
          this.loadRooms(); // Reload the rooms after addition
          this.newRoomName = ''; // Clear the input field
        },
        (error) => {
          console.error('Error adding room', error);
        }
      );
    } else {
      alert('Please enter a valid room name');
    }
  }

  // Delete a room by its ID
  deleteRoom(id: string): void {
    this.roomService.deleteRoom(this.institutionID, id).subscribe(
      () => this.loadRooms(),
      (error) => {
        console.error('Error deleting room', error);
      }
    );
  }
}
