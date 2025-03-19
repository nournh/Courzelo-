export interface GradeResponse {
    id: string;
    name: string;
    courseID: string;
    courseName: string;
    scoreToPass: number;
    groupID: string;
    institutionID: string;
    studentEmail: string;
    grade: number;
    average: number;
    valid: boolean;
}
