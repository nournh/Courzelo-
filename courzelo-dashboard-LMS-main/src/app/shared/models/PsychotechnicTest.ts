import { QuestionPsycho } from "./questionpsycho";

export interface Business {
  // Extend this as needed based on the real Business model in the backend
  id?: string;
  name?: string;
  // Add more fields as needed
}

export interface PsychotechnicTest {
  idPsychotechnicTest: string;
  title: string;
  creationDate: Date;
  intro: string;
  randomOrder: boolean;
  iduser: string;
  business: Business;
  questionspsycho: QuestionPsycho[];
}
