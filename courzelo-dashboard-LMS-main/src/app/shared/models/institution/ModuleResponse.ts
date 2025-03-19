import {CourseResponse} from "./CourseResponse";

export interface ModuleResponse {
    id: string;
    name: string;
    description: string;
    programID: string;
    institutionID: string;
    coursesID: string[];
    courses?: CourseResponse[];
}