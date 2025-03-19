export interface CourseRequest {
    name: string;
    description: string;
    skills: string[];
    semester: string;
    scoreToPass: number;
    duration: string;
    isFinished: boolean;
    credit: number;
    program: string;
    moduleID: string;
    courseParts: Map<string, number>;
}
