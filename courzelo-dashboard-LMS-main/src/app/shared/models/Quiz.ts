import {Question} from './Question';
import {status} from './status';



export class Quiz {
    id?: string;
    userEmail: string;
    title: string;
    description: string;
    questions: Question[] = [];
    duration: number;
    course: string;
    studentSubmissions?: StudentSubmission[];
    showSummary ? = false;
    showSimplifiedSummary ? = false;
    finalScore ? = 0;
    maxScore ? = 0;
    quizStarted?: boolean;
    quizEnded?: boolean ;
    timeRemaining?: number;
    createdAt?: Date;
}
export class StudentSubmission {
     studentId?: string;
     score?: number;
     completed?: boolean;
}
export class StudentQuizAnswers {
    questions?: Question[];
}
export class QuizSubmission {
    quizID: string;
    answers: { questionID: string, answer: string }[] = [];
}
export class QuizSubmissionResult {
    quizID: string;
    score: number;
    maxScore: number;
    passed: boolean;
    status: status;
    submittedAt: Date;
    Answers: { questionID: string, answer: string }[] = [];
}


