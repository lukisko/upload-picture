import * as MRE from '@microsoft/mixed-reality-extension-sdk';
export declare type MultipleChoiceProp = {
    numberOfOptions: number;
    correctAnswer: number;
    options: string[];
    padding: number;
    columns: number;
    height: number;
    width: number;
};
export declare type QuestionInfo = {
    options: string[];
    correctOption: number;
    question: string;
};
export default class MultipleChoice {
    private assets;
    private context;
    private centerPosition;
    private centerRotation;
    private localSpace;
    private isClosed;
    private usersAnswered;
    private correct;
    private tickPrefab;
    private XPrefab;
    private answersFromUsers;
    private numberOfQuestions;
    private questionActors;
    private answerActors;
    constructor(context: MRE.Context, assets: MRE.AssetContainer, centerPosition: MRE.Vector3Like, prop: MultipleChoiceProp, centerRotation?: MRE.QuaternionLike);
    private createTableOfQuestions;
    private createAnswers;
    private updateQuestion;
    private deleteQuestion;
    private addQuestion;
    private markItCorrect;
    private markItIncorrect;
    private formatText;
    private createQuestions;
    private creatIt;
    private answeredCorrectly;
    private answeredWrong;
}
//# sourceMappingURL=multipleChoice.d.ts.map