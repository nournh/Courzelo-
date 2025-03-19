import {ClasssRoomPostResponse} from './ClasssRoomPostResponse';
import {Quiz} from '../Quiz';
import {SafeUrl} from '@angular/platform-browser';

export interface ClassRoomResponse {
    imageSrc: SafeUrl;
    id?: string;
    name?: string;
    description?: string;
    course?: string;
    credit?: number;
    teacher?: string;
    group?: string;
    institutionID?: string;
    created?: Date;
    posts?: ClasssRoomPostResponse[];
    quizzes?: Quiz[];
}
