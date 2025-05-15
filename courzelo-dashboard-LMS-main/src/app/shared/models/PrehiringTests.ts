export class PrehiringTests {
    idPrehiringTest: string;
    title: string;
    creationDate: Date;
    intro: string;
    questions: Array<QuestionsBusiness>; // Adjusted to match backend
    iduser: string; // Adjusted to match backend
    business: any; // Adjust the type as per your backend definition
    randomOrder: boolean;

    constructor(idPrehiringTest: string,
        title: string,
        creationDate: Date,
        intro: string,
        questions: Array<QuestionsBusiness>, // Adjusted to match backend
        iduser: string, // Adjusted to match backend
        business: any, // Adjust the type as per your backend definition
        randomOrder: boolean) {
        this.idPrehiringTest = idPrehiringTest;
        this.title = title;
        this.creationDate = creationDate;
        this.intro = intro;
        this.questions = questions;
        this.iduser = iduser;
        this.business = business;
        this.randomOrder = randomOrder;
    }
}

export class QuestionsBusiness {
    questionId: number;
    questionLabel: string;
    falseResponses: Array<string>;
    correctResponses: Array<string>;
    score: number;
    time: number;
    typeQ: string;

    constructor(questionId: number,
        questionLabel: string,
        falseResponses: Array<string>,
        correctResponses: Array<string>,
        score: number,
        time: number,
        typeQ: string) {
        this.questionId = questionId;
        this.questionLabel = questionLabel;
        this.falseResponses = falseResponses;
        this.correctResponses = correctResponses;
        this.score = score;
        this.time = time;
        this.typeQ = typeQ;
    }
}