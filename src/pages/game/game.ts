import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, AlertController, ToastController, Content} from 'ionic-angular';
import {Http} from "@angular/http";
import {DatabaseEngine} from "../../scripts/DatabaseEngine";
import {GameEngine} from "../../scripts/GameEngine";
import {Consts} from "../../scripts/Consts";
import {AjaxEngine} from "../../scripts/AjaxEngine";

/*
  Generated class for the Game page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
declare var cordova : any;

@Component({
  selector: 'page-game',
  templateUrl: 'game.html',
})



export class GamePage {
  @ViewChild(Content) content : Content;
  private gameId;
  public taskHtml;
  public codeType;
  public codeValue;
  public inputCodeValue;
  public hints;
  private currentTask;
  private db;
  private title;
  private progress;
  private doneTasks;
  public rate: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http,
              public alertCtrl: AlertController, public toastCtrl: ToastController) {
    let main = this;
    main.gameId = navParams.get("GAME");
    main.db = new DatabaseEngine();
    main.db.executeSelect("SELECT * FROM GAME WHERE _ID = ?", [main.gameId])
      .then(function(res){
        let result = (<any> res)[0];
        main.title =  result["_NAME"];
      })


    ;
    main.getCurrentTask();
  }

  public prepareHtml(html):string{
    let directory = "home";
    try{
      directory = cordova.file.externalDataDirectory+"/"+this.gameId;
    }catch (err){

    }
    return html.split("%rootDir%").join(directory);
  }

  private getCurrentTask(){
    let sql = "select t.* " +
      "  from GAME_ORDER go, TASK t" +
      "  where 1=1" +
      "    and go.DONE = 0" +
      "    and go.TASK_ID = t._ID" +
      "    and go.GAME_ID = ?" +
      "  order by go.task_order";
    let main = this;
    return main.db.executeSelect(sql,[main.gameId])
      .then(function(res){
        let result = (<any>res)[0];
        main.currentTask = result;
        main.getCodes().then(function(res){
          let codes = (<any>res);
          main.codeType = "SIMPLE";
          main.codeValue = "";
          for(let i = 0; i < codes.length; i++){
            if(codes[i]._VALUE == "TECH_NEXT"){
              main.codeValue = "TECH_NEXT";
              break;
            }
          }
          for(let i = 0; i < codes.length; i++){
            if(codes[i]._VALUE == "TECH_FINISH"){
              main.codeValue = "TECH_FINISH";
              break;
            }
          }

        });
        main.taskHtml = main.prepareHtml(result._TEXT);
        return main.getHintHtml();

      })
      .then(function () {
        let sql = "SELECT COUNT(*) NUM FROM GAME_ORDER WHERE GAME_ID = ? AND DONE = 1";
        return main.db.executeSelect(sql, [main.gameId]);
      })
      .then(function(res){
        let result =  (<any>res)[0];
        main.doneTasks = parseInt(result["NUM"]) + 1;
        return main.db.executeSelect("SELECT COUNT(*) NUM FROM GAME_ORDER WHERE GAME_ID = ?", [main.gameId])
      })
      .then(function(res){
        let result = (<any> res)[0];
        let numOfTasks = parseInt(result["NUM"]);
        main.progress = "Задание "+main.doneTasks+" из "+numOfTasks;
      })
      .catch(function (err) {
        alert(err);
      });
  }
  public getHintHtml(){
    let sqlHint = "SELECT * FROM HINT WHERE TASK_ID = ? AND USED = 1";
    let main = this;
    return main.db.executeSelect(sqlHint,[main.currentTask["_ID"]]).then(
      function(res){
        main.hints = (<any> res);
        return Promise.resolve()
      });
  }
  public takeHint(){
    let main = this;
    this.showCheckDialog("Подсказка","Вы точно хотите, чтобы вам подсказали?").then(function(res){
      if(res==1){
        let sql = "SELECT * FROM HINT WHERE TASK_ID = ? AND USED = 0 ORDER BY _ID";
        // WHERE TASK_ID = ? AND USED = 0 ORDER BY HINT_ORDER
        main.db.executeSelect(sql, [main.currentTask._ID])
          .then(function (res) {
          if((<any>res).length > 0){
            let result = (<any>res)[0];
            let id = result._ID;
            let sqlUpdate = "UPDATE HINT SET USED = 1 WHERE _ID = ?";
            main.db.executeScript(sqlUpdate, [id])
              .then(function(){
                main.getHintHtml().then(function() {
                    let y = document.getElementById('buttonHelp').offsetTop;
                    return main.content.scrollTo(0, y, 1000);
                  }
                );
              })
              .catch(function(err){
                alert(err);
              });
          }
        });

      }
    })
  }

  public showCheckDialog(title, text){
    let main = this;
    return new Promise<number>(function(resolve){
      let confirm = main.alertCtrl.create({
        title: title,
        message: text,
        buttons:[
          {
            text: 'Да',
            handler: () => { resolve(1)}
          },
          {
            text: 'Нет',
            handler: () => { resolve(0)}
          }]
      });

      confirm.present()
    });
  }

  public getCodes(){
    let main = this;
    return main.db.executeSelect("SELECT * FROM CODE WHERE TASK_ID = ?",[main.currentTask._ID]);
  }
  public checkCodeClick(){
    let codeValue = this.inputCodeValue;
    this.checkCode(codeValue);
  }
  public checkCode(codeValue){
    let main = this;
    GameEngine.checkCode(this.db, this.currentTask._ID, codeValue)
      .then(function(res){
        if (codeValue != 'TECH_NEXT')
        {
          let toast = main.toastCtrl.create({
            message: 'Ответ верен! Играйте дальше.',
            position: 'top',
            cssClass: 'toast-success',
            duration: 2000
          });
          toast.present(toast);
        }
        GameEngine.checkTaskDone(main.db, main.currentTask._ID)
          .then(function(res){
            if(res==1){
              GameEngine.setTaskDone(main.db, main.currentTask._ID)
                .then(function(){
                  main.inputCodeValue = "";
                  main.getCurrentTask();
                });
            }
          })
        ;
      })
      .catch(function(err){
        if(err=='0'){
          let toast = main.toastCtrl.create({
            message: 'Увы, Ответ неверен.',
            position: 'top',
            cssClass: 'toast-err',
            duration: 2000,
          });
          toast.present(toast);
        }
        GameEngine.checkTaskDone(main.db, main.currentTask._ID)
          .then(function(res){
            if(res==1){
              GameEngine.setTaskDone(main.db, main.currentTask._ID)
                .then(function(){
                  main.getCurrentTask();
                });
            }
          })
        ;
      })
  }
  public setRating(){
    let rate = this.rate;
    let gameId = this.gameId;
    let main = this;
    let session = localStorage.getItem("SID");
    AjaxEngine.call(main.http,
      "POST",
      Consts.const_cgi + "setRating/"+gameId,
      {
        "functionName": "setRating",
        "gameId": gameId,
        "SID": session,
        "rating": rate
      });

  }
  public restart(){
    let main = this;
    let gameId = main.gameId;
    GameEngine.resetGame(main.db, gameId)
      .then(function(){
        main.getCurrentTask();
      });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad GamePage');
  }

}
