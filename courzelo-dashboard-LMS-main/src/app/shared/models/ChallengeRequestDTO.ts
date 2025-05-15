import { AuthBusiness } from "./user/AuthBusiness";
export interface ChallengeTaskDTO {
    question: string;
    expectedAnswer: string;
  }
  
  export interface ChallengeRequestDTO {
    title: string;
    description: string;
    difficulty: string;
    tasks: ChallengeTaskDTO[];
    requiredSkills: string[]; // Add this line
     business: AuthBusiness;
     assignedCandidates?: Set<string>;
  }