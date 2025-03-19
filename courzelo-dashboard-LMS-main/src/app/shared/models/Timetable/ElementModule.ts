import {Semester} from './Timetable';
import {UserResponse} from '../user/UserResponse';
import {ClassRoomResponse} from '../institution/ClassRoomResponse';
import {GroupResponse} from '../institution/GroupResponse';

export interface ElementModule {
    id?: string;
    name?: string;
    teacher?: string;
    institutionID?: string;
    students?: string[];
    course?: string;
    group?: string;
    nmbrHours?: number;
    dayOfWeek?: string;
    period?: string;
    semesters?: number[];
    classId?: string;
    courseId?: string;
    teacherId?: string;
}
