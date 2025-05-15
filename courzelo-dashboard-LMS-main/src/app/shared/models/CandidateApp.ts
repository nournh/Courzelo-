import { Time } from "@angular/common";
import { JobOffersDTO } from "./JobOffers.model";
import { UserResponse } from "./user/UserResponse";

export class CandidateApp{
    idCandidateApp:any;
    applicationDate:Date;
    tests:Array<string>;
    cv:string;
    candidateState:AppState[];
    currentState:AppState;
    job:JobOffersDTO;
    user:UserResponse;
  
    constructor(idCandidateApp:any,applicationDate:Date,tests:Array<string>,cv:string,candidateState:AppState[],
        currentState:AppState,job:JobOffersDTO,user:UserResponse){

            this.idCandidateApp = idCandidateApp;
            this.applicationDate = applicationDate;
            this.tests = tests;
            this.candidateState =candidateState;
            this.currentState =currentState;
             this.cv=cv
            this.job =job;
            this.user=user
           

        }

}


export class AppState{
    idCandidateState:any;
    stateDate:Date;
    label:string;
    step:number;
    score:number;
    idPrehiringTest:string;
    idTest:string;
    linkMeet:string;
    interviewDate:any;
    testState:boolean;
    offerDoc:string
    


    constructor(
        idCandidateState:any,
        stateDate:Date,
        label:string,
        step:number,
        score:number,
        idPrehiringTest:string,
        idTest:string,
        linkMeet:string,
        interviewDate:any,
       
        testState:boolean,offerDoc:string
        
        ){
            this.idCandidateState = idCandidateState;
            this.stateDate = stateDate;
            this.label = label;
            this.step = step;
            this.score = score;
            this.testState = testState;
            this.idTest=idTest;
            this.idPrehiringTest=idPrehiringTest;
            this.linkMeet=linkMeet;
            this.interviewDate=interviewDate;
            this.offerDoc=offerDoc;
            
        }
      

}