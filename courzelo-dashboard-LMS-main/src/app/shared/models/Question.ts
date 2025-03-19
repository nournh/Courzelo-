import {QuestionType} from './QuestionType';

export class Question {
    id?: string;
    text?: string;
    options?: string[];
    correctAnswer?: string;
    type?: QuestionType;
    answer?: string;
    points?: number;
}
