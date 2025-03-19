import {AssessmentRequest} from './AssessmentRequest';

export interface CourseResponse {
    classroomTeacher?: string;
    id?: string;
    name?: string;
    description?: string;
    skills?: string[];
    semester?: string;
    duration?: string;
    scoreToPass?: number;
    credit?: number;
    assessments?: AssessmentRequest[];
    isFinished?: boolean;
    institutionID?: string;
    program?: string;
    moduleID?: string;
    classroomCreated?: boolean;
    classroomID?: string;
    courseParts: Map<string, number>;
}
