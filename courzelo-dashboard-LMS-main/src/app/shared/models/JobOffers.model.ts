import { AuthBusiness } from "./user/AuthBusiness";
export interface JobOffersDTO {



  idJob: string;

  title: string;

  description: string;

  creationDate: Date;

  deadlineDate: Date;

  startDate: Date;

  industry: string;
  
  subIndustry:String;

  state: string;

  jobType: string;

  schedulesType: string;

  country: string;

  location: string;

  locationType: string;

  requirement: string[];

  hireNumber: number;

  salary: number;

  salaryOption: string;

  salaryRangeMax: number;

  salaryRangeMin: number;

  salaryStartAmount: number;

  salaryCurrency: string;

  jobBenefits: string;

  communication: boolean;

  communicationMails: string[];

  businessId: string;

  idRecuiter: string;

  idPrehiringTest: string;

  idTest: string[];
  businesss: AuthBusiness;
  business: { idBusiness: string };
}


