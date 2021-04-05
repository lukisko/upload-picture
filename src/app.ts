import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { text } from 'express';
import fs from 'fs';
//import groupMask from './groupMask';
//import Board from './interactiveBoard';
//import WearHat from "./wearHat";
import MultipleChoice, { MultipleChoiceProp } from './multipleChoice'; //when set to 16 0 -4

/*export type userTrack = {
	user: MRE.User;
	hat: MRE.Actor;
	stars: MRE.Actor[];
}*/

type imageDimensions = {
	width: number,
	height: number
}

const imageInfo: imageDimensions = require("../public/uploads/images/new.json");

export default class LearningWorld {
	private assets: MRE.AssetContainer;
	//private board: Board;
	//private starSystem: groupMask;
	//private usersTrack: userTrack[];
	//private wearHat: WearHat;
	//////////////-------------------------------------------------note: make the magnetic field a little into board

	constructor(private context: MRE.Context) {
		//this.usersTrack = [];
		this.assets = new MRE.AssetContainer(this.context);
		//this.starSystem = new groupMask(this.context, this.assets, this.usersTrack);
		/*this.wearHat = new WearHat(this.context, this.assets,
			{ x: 0, y: 0, z: -3 }, { x: 0, y: 0, z: 0, w: 1 }, this.usersTrack);*/
		this.context.onStarted(() => {
			this.started();
			//this.starSystem.start();
		});
		/*this.context.onUserJoined((user) => {
			this.starSystem.userJoined(user);
		});
		this.context.onUserLeft((user) => {
			this.starSystem.userLeft(user);
		});*/
		/*const multipleChoiceProp: MultipleChoiceProp = {
			numberOfOptions: 5,
			//correctAnswer: 5,
			padding: 0.1,
			columns: 2,
			height: 0.17,
			width: 0.5,
			correctAnswer:1,
			options:["some","other","options"]
		}
		const choice = new MultipleChoice(this.context, this.assets,
			{ x: 1, y: 3.5, z: 1 }, multipleChoiceProp);*/
	}

	private started() {
		//console.log("everithing has started--------------");
		//this.board = new Board(this.context, this.assets, { x: 0, y: 0, z: 0 });
		/*const textureFromWeb = await this.assets.createTexture("web texture",{
			uri:"https://upload.wikimedia.org/wikipedia/commons/3/31/Wiki_logo_Nupedia.jpg"
		});
		let somethign = MRE.Actor.CreatePrimitive(this.assets,{
			definition:{
				shape:MRE.PrimitiveShape.Box,
			},
			addCollider: true,
			actor:{
				transform:{local:{position:{x:0,y:2.5,z:0}}},
			}
		});*/
		//this.board.createIt2();
		//this.starSystem.start();
		//console.log("hat is going to be created!");
		/*let test = MRE.Actor.CreateFromGltf(this.assets,{
			uri:'napoleonHat.gltf',
			colliderType:"mesh",
			actor:{
				transform:{app:{position:{x:0,y:5,z:0}}}
			}
		});*/
		//console.log(test.id);



		const someTexture = this.assets.createTexture("demoTexture",{
			uri: "uploads/images/new.png"
		});
		const someMaterial = this.assets.createMaterial("someMaterial",{
			mainTextureId:someTexture.id,
		});

		const startPicture = MRE.Actor.CreatePrimitive(this.assets,{
			definition:{
				shape: MRE.PrimitiveShape.Box,
				dimensions:{x:imageInfo.width/100,y:imageInfo.height/100,z:0.001}
			},
			addCollider:true,
			actor:{
				transform:{app:{position:{x:0,y:1,z:0}}},
				/*appearance:{
					materialId:someMaterial.id,
				}*/
			}
		});

		const pictureButton = startPicture.setBehavior(MRE.ButtonBehavior);
		pictureButton.onClick((user)=>{
			user.prompt("what is name of the picture?",true)
			.then((value1)=>{
				if (value1.submitted){
					console.log(value1.text === "list all");
					if (value1.text === "list all"){
						fs.readdir("./public/uploads/images/",(err,files)=>{
							if (err) {console.log(err); return;};
							let str= "";
							files.forEach((value2)=>{
								if (value2.match(".png")){
									str+=value2.substring(0,value2.length-4)+",";
								}
							});
							console.log(str);
							user.prompt(str);
						})
						return;
					}
					try{
						this.loadPicture(value1.text);
						startPicture.destroy()
					} catch (err){
						user.prompt("sorry, I could not find picture with that name.")
					}
				}
			})
		})

		MRE.Actor.CreateFromLibrary(this.context, {
			resourceId: "1695891900889825873",
			actor: {
				transform: { local: { position: { x: 0, y: 2, z: 0 } } }
			}
		});
	}

	private loadPicture(name: string){
		const imageInfo: imageDimensions = require("../public/uploads/images/"+name+".json");
		const someTexture = this.assets.createTexture(name,{
			uri: "uploads/images/"+name+".png"
		});
		const someMaterial = this.assets.createMaterial(name,{
			mainTextureId:someTexture.id,
		});
		const newPicture = MRE.Actor.CreatePrimitive(this.assets,{
			definition:{
				shape: MRE.PrimitiveShape.Box,
				dimensions:{x:imageInfo.width/100,y:imageInfo.height/100,z:0.001}
			},
			addCollider:true,
			actor:{
				transform:{app:{position:{x:0,y:1,z:0}}},
				appearance:{
					materialId:someMaterial.id,
				}
			}
		});

		const pictureButton = newPicture.setBehavior(MRE.ButtonBehavior);
		pictureButton.onClick((user)=>{
			user.prompt("What is name of the picture?",true)
			.then((value1)=>{
				if (value1.submitted){
					console.log(value1.text);
					if (value1.text === "list all"){
						fs.readdir("../public/uploads/images/",(err,files)=>{
							if (err) return;
							let str= "";
							files.forEach((value2)=>{
								str+=value2+",";
							});
						})
						return;
					}
					try{
						this.loadPicture(value1.text);
						newPicture.destroy()
					} catch (err){
						user.prompt("sorry, I could not find picture with that name.")
					}
				}
			})
		})
	}
}
