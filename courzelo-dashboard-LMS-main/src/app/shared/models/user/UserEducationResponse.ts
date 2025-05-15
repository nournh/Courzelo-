/*import {SimplifiedClassRoomResponse} from '../institution/SimplifiedClassRoomResponse';

export interface UserEducationResponse {
    institutionID?: string;
    institutionName?: string;
    classrooms?: SimplifiedClassRoomResponse[];
    groupID?: string;
}*/
import { SimplifiedClassRoomResponse } from '../institution/SimplifiedClassRoomResponse';

export interface InstitutionForUser {
  institutionID: string;
  institutionName: string;
  classrooms?: SimplifiedClassRoomResponse[];
}

export interface UserEducationResponse {
  institutionID?: string;
  institutionName?: string;
  classrooms?: SimplifiedClassRoomResponse[];
  groupID?: string;

  // Ajouté pour les utilisateurs multi-institution (ex: TEACHER)
  institutions?: InstitutionForUser[];
}