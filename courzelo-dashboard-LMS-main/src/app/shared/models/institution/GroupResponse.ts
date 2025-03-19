import {SimplifiedClassRoomResponse} from './SimplifiedClassRoomResponse';
import {SimplifiedProgramResponse} from './SimplifiedProgramResponse';

export interface GroupResponse {
    id?: string;
    name?: string;
    institutionID?: string;
    students?: string[];
    classrooms?: SimplifiedClassRoomResponse[];
    program?: string;
    simplifiedProgram?: SimplifiedProgramResponse;
}
