import {SimplifiedClassRoomResponse} from '../institution/SimplifiedClassRoomResponse';

export interface UserEducationResponse {
    institutionID?: string;
    institutionName?: string;
    classrooms?: SimplifiedClassRoomResponse[];
    groupID?: string;
}
