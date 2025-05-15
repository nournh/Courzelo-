export interface QuestionsBusiness {
  questionId: number;
  questionLabel: string;
  falseResponses: string[];
  correctResponses: string[];
  score: number;
  time: number;
  typeQ: string;
}