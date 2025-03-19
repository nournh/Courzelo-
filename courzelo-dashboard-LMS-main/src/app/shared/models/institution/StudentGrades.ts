export interface StudentGrades {
    studentEmail: string;
    image: string;
    grades: { [key: string]: {    gradeID: string, score: number, valid: boolean, validityFound: boolean} };
}
