"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
const fs = __importStar(require("fs"));
const height = 0.15; //height of text
const answerWidth = 1; //max width of option button
const questionWidth = 3; //max width of question
const columns = 2; //number of columns to have answers in
const padding = 0.1; // padding between questions and options in between
// eslint-disable-next-line @typescript-eslint/no-var-requires
const database = require("../public/Questionare.json");
class MultipleChoice {
    //private usersAnsweredGlobal: MRE.Guid[][];
    constructor(context, assets, centerPosition, prop, centerRotation = { x: 0, y: 0, z: 0, w: 1 }) {
        this.context = context;
        this.assets = assets;
        this.centerPosition = centerPosition;
        this.centerRotation = centerRotation;
        this.usersAnswered = [];
        //console.log(database);
        //this.usersAnsweredGlobal = [[],[],[],[],[],[]];
        this.isClosed = true; //TODO delete
        /*this.door = new Door(this.context, this.assets, {
            x: this.centerPosition.x + 8.285-1,
            y: this.centerPosition.y - 1,
            z: this.centerPosition.z - 6.242-1
        });*/
        this.answersFromUsers = [];
        this.numberOfQuestions = Object.keys(database).length;
        for (let i = 0; i < this.numberOfQuestions; i++) {
            this.answersFromUsers.push(null);
        }
        //this.creatIt(prop);
        /*const questions = [
            "Was the Soviet Union part of the Allied forces?",
            "Did America liberate France during WWII?",
            "Was China part of the Pearl Harbor Attack?",
            "Did Hitler get executed?",
            "Did Hitler’s nephew write a magazine article title ‘Why I hate my Uncle’?",
            "The term “D-Day” refers to the invasion of Normandy the 6 June 1944?",
        ];
        this.correct = [
            1,2,2,2,1,1
        ];*/
        //this.createQuestions(questions,this.correct,prop);
        this.questionActors = [];
        this.createTableOfQuestions(this.centerPosition, database);
    }
    //--------------------------------------------------- new part
    // instanc
    // const - text height, label width
    async createTableOfQuestions(position, questions) {
        this.tickPrefab = await this.assets.loadGltf("tick.gltf", "mesh");
        this.XPrefab = await this.assets.loadGltf('X.gltf', "mesh");
        let yCoordinate = position.y;
        for (let i = 0; i < questions.length; i++) {
            const tempX = position.x;
            const tempY = yCoordinate - (height + padding);
            const tempZ = position.z;
            const question = MRE.Actor.Create(this.context, {
                actor: {
                    name: i.toString(),
                    transform: {
                        local: {
                            position: {
                                x: tempX,
                                y: tempY,
                                z: tempZ
                            }
                        }
                    },
                    text: {
                        contents: this.formatText(questions[i].question, questionWidth, 2),
                        height: height,
                        anchor: MRE.TextAnchorLocation.MiddleCenter,
                    },
                    collider: {
                        geometry: {
                            shape: MRE.ColliderType.Box,
                            size: { x: 0.5, y: 0.2, z: 0.2 },
                            center: { x: 0.25, y: 0, z: 0 }
                        }
                    }
                }
            });
            question.subscribe("transform");
            this.questionActors.push(question);
            const questionButton = question.setBehavior(MRE.ButtonBehavior);
            questionButton.onClick((user) => {
                // TODO : make something so just some users can alter questions
                // TODO : make something so there will be ask for quesitons
                user.prompt("what will be new question?", true)
                    .then(async (dialog) => {
                    if (dialog.submitted) {
                        if (dialog.text === '-') {
                            this.deleteQuestion(question);
                            return;
                        }
                        if (dialog.text.startsWith('+')) {
                            let info = {
                                question: dialog.text.substring(1),
                                correctOption: 1,
                                options: []
                            };
                            let i = 0;
                            let answer = await user.prompt("how many options to have?", true);
                            if (answer.submitted) {
                                i = parseInt(answer.text);
                            }
                            for (let j = 1; j <= i; j++) {
                                answer = await user.prompt(j + ". option?", true);
                                if (answer.text.startsWith("+")) {
                                    info.correctOption = j;
                                    info.options.push(answer.text.substring(1));
                                }
                                else {
                                    info.options.push(answer.text);
                                }
                            }
                            this.addQuestion(info);
                            return;
                        }
                        this.updateQuestion(question, {
                            question: dialog.text,
                            options: ["yes", "no"],
                            correctOption: 1,
                        });
                    }
                    //console.log(question.transform.app.position.y);
                });
            });
            this.createAnswers(question, questions[i]);
            const numberOfRows = Math.ceil(questions[i].options.length / columns);
            const totalHeight = numberOfRows * (padding + height) + padding;
            yCoordinate -= totalHeight;
        }
        // TODO : make button to add questions
    }
    createAnswers(parent, info) {
        const numberOfRows = Math.ceil(info.options.length / columns);
        //put thit into questions maybe
        for (let i = 0; i < info.options.length; i++) {
            const option = MRE.Actor.CreatePrimitive(this.assets, {
                definition: {
                    shape: MRE.PrimitiveShape.Box,
                    dimensions: { x: answerWidth, y: height, z: 0.1 }
                },
                addCollider: true,
                actor: {
                    name: (i + 1).toString(),
                    parentId: parent.id,
                    transform: {
                        local: {
                            position: {
                                x: parent.transform.app.position.x +
                                    Math.floor(i / numberOfRows) * (answerWidth + padding) + questionWidth,
                                y: parent.transform.app.position.y +
                                    height / 2 - (i % numberOfRows) * (height + padding),
                                z: parent.transform.app.position.z
                            }
                        }
                    },
                    text: {
                        contents: this.formatText(info.options[i], 100, 2),
                        anchor: MRE.TextAnchorLocation.MiddleLeft,
                        height: height,
                    }
                }
            });
            //console.log(parent.transform.app.position.x);
            const optionButton = option.setBehavior(MRE.ButtonBehavior);
            //console.log('option made');
            optionButton.onClick((user) => {
                //console.log('option button pressed');
                if (parent.findChildrenByName("symbol", true).length > 0) {
                    return;
                } // if the question is already answered then it will just return
                if (i === info.correctOption - 1) {
                    this.markItCorrect(option);
                }
                else {
                    this.markItIncorrect(option);
                    const correctAnswer = parent.findChildrenByName(info.correctOption.toString(), false);
                    //console.log(correctAnswer[0].name);
                    this.markItCorrect(correctAnswer[0]);
                }
                //maybe to make track of what questions were answered
            });
        }
    }
    updateQuestion(oldQuestion, info) {
        database[parseInt(oldQuestion.name)] = info;
        let dataToWrite = JSON.stringify(database, null, 2);
        //console.log(dataToWrite);
        fs.writeFile("./public/Questionare.json", dataToWrite, () => { });
        oldQuestion.enableText({
            //color: { r: 1, g: 1, b: 1 },
            contents: this.formatText(info.question, questionWidth, 2),
            height: height,
            anchor: MRE.TextAnchorLocation.MiddleLeft
        });
        const actorsToDelete = oldQuestion.children;
        actorsToDelete.forEach(element => {
            element.destroy();
        });
        this.createAnswers(oldQuestion, info);
        //TODO write to file if this is changed
    }
    deleteQuestion(oldQuestion) {
        database.splice(parseInt(oldQuestion.name), 1);
        let dataToWrite = JSON.stringify(database, null, 2);
        //console.log(dataToWrite);
        fs.writeFile("./public/Questionare.json", dataToWrite, () => { });
        this.questionActors.map((value) => {
            value.destroy();
        });
        this.createTableOfQuestions(this.centerPosition, database);
    }
    addQuestion(info) {
        database.push(info);
        let dataToWrite = JSON.stringify(database, null, 2);
        //console.log(dataToWrite);
        fs.writeFile("./public/Questionare.json", dataToWrite, () => { });
        this.questionActors.map((value) => {
            value.destroy();
        });
        this.createTableOfQuestions(this.centerPosition, database);
    }
    //prefabs needs to be already loaded
    markItCorrect(parent) {
        parent.enableText({
            color: { r: 0, g: 1, b: 0 },
            contents: parent.text.contents,
            height: height,
            anchor: MRE.TextAnchorLocation.MiddleLeft
        });
        const symbol = MRE.Actor.CreateFromPrefab(this.context, {
            firstPrefabFrom: this.tickPrefab,
            actor: {
                name: "symbol",
                parentId: parent.id,
                transform: {
                    local: {
                        position: {
                            x: 0,
                            y: 0,
                            z: -0.05
                        },
                        rotation: { x: 0, y: 1, z: 0, w: 0 },
                        scale: { x: 0.2, y: 0.2, z: 0.2 }
                    }
                }
            }
        });
    }
    markItIncorrect(parent) {
        parent.enableText({
            color: { r: 1, g: 0, b: 0 },
            contents: parent.text.contents,
            height: height,
            anchor: MRE.TextAnchorLocation.MiddleLeft
        });
        const symbol = MRE.Actor.CreateFromPrefab(this.context, {
            firstPrefabFrom: this.XPrefab,
            actor: {
                name: "symbol",
                parentId: parent.id,
                transform: {
                    local: {
                        position: {
                            x: 0,
                            y: 0,
                            z: -0.05
                        },
                        rotation: { x: 0, y: 1, z: 0, w: 0 },
                        scale: { x: 0.2, y: 0.2, z: 0.2 }
                    }
                }
            }
        });
    }
    formatText(text, maxWidth, maxLines) {
        return text;
    }
    //--------------------------------------------------- old part
    /*
    for (const [key, value] of Object.entries(object1)) {
        console.log(`${key}: ${value}`);
    }
    */
    async createQuestions(questions, correct, prop) {
        this.tickPrefab = await this.assets.loadGltf("tick.gltf", "mesh");
        this.XPrefab = await this.assets.loadGltf('X.gltf', "mesh");
        MRE.Actor.Create(this.context, {
            actor: {
                transform: {
                    local: {
                        position: {
                            x: this.centerPosition.x - 0.2 + 3.1,
                            y: this.centerPosition.y + 1.5 + 0.5,
                            z: this.centerPosition.z
                        }
                    }
                },
                text: {
                    contents: "Yes",
                    height: 0.2
                }
            }
        });
        MRE.Actor.Create(this.context, {
            actor: {
                transform: {
                    local: {
                        position: {
                            x: this.centerPosition.x + 0.45 + 3.1,
                            y: this.centerPosition.y + 1.5 + 0.5,
                            z: this.centerPosition.z
                        }
                    }
                },
                text: {
                    contents: "No",
                    height: 0.2
                }
            }
        });
        for (let i = 0; i < questions.length; i++) {
            const tempX = this.centerPosition.x;
            const tempY = this.centerPosition.y - i * (prop.height + prop.padding) + 1 + 0.5;
            const tempZ = this.centerPosition.z;
            const question = MRE.Actor.Create(this.context, {
                actor: {
                    transform: {
                        local: {
                            position: {
                                x: tempX - 3,
                                y: tempY + prop.height,
                                z: tempZ
                            }
                        }
                    },
                    text: {
                        contents: questions[i],
                        height: prop.height
                    },
                    collider: {
                        geometry: {
                            shape: MRE.ColliderType.Box,
                            size: { x: 0.5, y: 0.2, z: 0.2 },
                            center: { x: 0.25, y: -0.15, z: 0 }
                        }
                    }
                }
            });
            const nextProp = {
                numberOfOptions: 2,
                padding: prop.padding,
                columns: 2,
                height: prop.height,
                width: prop.width,
                correctAnswer: correct[i],
                options: ["error//TODO"]
            };
            this.creatIt(nextProp, { x: tempX + 3.1, y: tempY, z: tempZ }, i);
            const questionButton = question.setBehavior(MRE.ButtonBehavior);
            questionButton.onClick((user) => {
                if (user.properties['altspacevr-roles'] !== "") {
                    user.prompt("what new question do you want?", true)
                        .then((value) => {
                        if (value.submitted) {
                            const newQuestion = value.text;
                            user.prompt("What is the answer? Yes/No?", true)
                                .then((value2) => {
                                if (value2.submitted) {
                                    if (/[Yy]es/u.test(value2.text)) {
                                        this.correct[i] = 1;
                                    }
                                    else if (/[Nn]o/u.test(value2.text)) {
                                        this.correct[i] = 2;
                                    }
                                    question.enableText({
                                        contents: newQuestion,
                                        height: prop.height,
                                    });
                                    //this.usersAnsweredGlobal = [[],[],[],[],[],[]];
                                    this.answersFromUsers.map((object) => {
                                        object.destroy();
                                    });
                                    this.answersFromUsers = [];
                                }
                            });
                        }
                    });
                }
            });
        }
    }
    creatIt(prop, questionPosition, j) {
        const usersAnsweredLocal = [];
        const transparent = this.assets.createMaterial("transparent", {
            color: { r: 0.2, g: 0.2, b: 0, a: 0.2 }
        });
        const main = MRE.Actor.Create(this.context, {
            actor: {
                transform: {
                    app: {
                        position: questionPosition,
                        rotation: this.centerRotation
                    }
                }
            }
        });
        const numberOfRows = Math.ceil(prop.numberOfOptions / prop.columns);
        const height = numberOfRows * (prop.padding + prop.height) - prop.padding;
        for (let i = 0; i < prop.numberOfOptions; i++) {
            const option = MRE.Actor.CreatePrimitive(this.assets, {
                definition: {
                    shape: MRE.PrimitiveShape.Box,
                    dimensions: { x: prop.width, y: prop.height, z: 0.1 }
                },
                addCollider: true,
                actor: {
                    parentId: main.id,
                    transform: {
                        local: {
                            position: {
                                x: Math.floor(i / numberOfRows) * (prop.width + prop.padding),
                                y: height / 2 - (i % numberOfRows) * (prop.height + prop.padding),
                                z: 0
                            }
                        }
                    },
                    appearance: { materialId: transparent.id }
                }
            });
            const optionButton = option.setBehavior(MRE.ButtonBehavior);
            //console.log('option made');
            optionButton.onClick((user) => {
                //console.log('option button pressed');
                if (this.answersFromUsers[j] !== null) {
                    return;
                }
                //console.log(this.correct);
                //console.log(i,this.correct[j]);
                if (i === this.correct[j] - 1) {
                    this.answeredCorrectly(j, prop, option);
                }
                else {
                    this.answeredWrong(j, prop, option);
                }
                const userThatJustAnswered = this.usersAnswered.find(value => value.user === user.id);
                if (userThatJustAnswered === undefined) {
                    this.usersAnswered.push({ user: user.id, number: 1 });
                }
                else {
                    userThatJustAnswered.number++;
                    //console.log(userThatJustAnswered.number);
                }
                //this.usersAnsweredGlobal[j].push(user.id);
                if (this.isClosed) {
                    //this.door.openDoor();
                }
            });
        }
    }
    answeredCorrectly(questionOrder, prop, option) {
        const symbol = MRE.Actor.CreateFromPrefab(this.context, {
            firstPrefabFrom: this.tickPrefab,
            actor: {
                parentId: option.id,
                //exclusiveToUser: user.id,
                transform: {
                    local: {
                        position: {
                            x: -prop.width / 2 + 0.1,
                            y: 0,
                            z: -0.1
                        },
                        rotation: {
                            x: 0, y: 1, z: 0, w: 0
                        },
                        scale: {
                            x: 0.2, y: 0.2, z: 0.2
                        }
                    }
                }
            }
        });
        //this.answersFromUsers.push(symbol);
        this.answersFromUsers[questionOrder] = symbol;
    }
    answeredWrong(questionOrder, prop, option) {
        const symbol = MRE.Actor.CreateFromPrefab(this.context, {
            firstPrefabFrom: this.XPrefab,
            actor: {
                parentId: option.id,
                //exclusiveToUser: user.id,
                transform: {
                    local: {
                        position: {
                            x: -prop.width / 2 + 0.1,
                            y: 0,
                            z: -0.1
                        },
                        rotation: { x: 0, y: 1, z: 0, w: 0 },
                        scale: { x: 0.2, y: 0.2, z: 0.2 }
                    }
                }
            }
        });
        //this.answersFromUsers.push(symbol);
        this.answersFromUsers[questionOrder] = symbol;
    }
}
exports.default = MultipleChoice;
//# sourceMappingURL=multipleChoice.js.map