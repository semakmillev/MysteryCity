import {
  Component, ComponentFactory, ComponentFactoryResolver, ViewChild, ViewContainerRef,
  NgModule
} from '@angular/core';
import {NavController, NavParams, MenuController, LoadingController} from 'ionic-angular';
import {AjaxEngine} from "../../scripts/AjaxEngine";
import {Consts} from "../../scripts/Consts";
import {Http} from "@angular/http";
import {DatabaseEngine} from "../../scripts/DatabaseEngine";
import {LoginPage} from "../login/login";
import {FileDownloader} from "../../scripts/FileDownloader";
import {Transfer} from "ionic-native";
import {GameDownloader} from "../../scripts/GameDownloader";
import {window} from "rxjs/operator/window";
import {GamePage} from "../game/game";
import {YandexPayment} from "../../scripts/YandexPayment";

/*
  Generated class for the GameList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
declare var cordova:any;


@Component({
  selector: 'page-game-list',
  templateUrl: 'game-list.html',

})
export class GameListPage {

  private games;
  private downloadedGames;
  public showInfo : boolean = false;
  public footerType : string;
  public footerText : string;
  public storage : Storage;
  public footerClass = "hiddenFooter";
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, private menu: MenuController, public loadingCtrl: LoadingController){
    this.loadGameList();
    this.menu.swipeEnable(true,"mainMenu");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GameListPage');
  }

  private loadGameList() {

    let session = localStorage.getItem("SID");
    let main = this;
    if (session == null) {
      session = "";
    }
    //$.mobile.loading('show', {});
    let db = new DatabaseEngine();
    db.executeSelect("SELECT * FROM GAME",[])
      .then(function (res) {AjaxEngine
        main.downloadedGames = (<any>res);
        for(let i = 0; i < main.downloadedGames; i++){

        }
        //alert(main.downloadedGames);
        AjaxEngine.call(main.http, "GET", Consts.const_cgi + "getGamesTest", {
          "SID": session
        })
          .then(function (res) {
            main.games = (<any>res);
            for (let i = 0; i < main.games.length; i++) {

              if (main.downloadedGames.filter(function(obj){return obj._ID == main.games[i]._ID;}).length > 0) {
                main.games[i].BUTTON_NAME = 'Играть!';
                main.games[i].DOWNLOADED = 1;
              } else {
                console.log(main.games[i].PAID);
                main.games[i].DOWNLOADED = 0;
                if (main.games[i].PAID == 0 && main.games[i].PRICE > 0) {
                  if(main.games[i].PRICE != main.games[i].REAL_PRICE){
                    main.games[i].BUTTON_NAME = 'Купить (<s>' + main.games[i].PRICE + '</s> '+ main.games[i].REAL_PRICE.toFixed(0) +' р.)'
                  }else {
                    main.games[i].BUTTON_NAME = 'Купить (' + main.games[i].PRICE + ' р.)';
                  }
                  //main.games[i].BUTTON_EVENT = 'makePayment('+main.games[i]._ID+','+main.games[i].PRICE+')';
                } else {
                  main.games[i].BUTTON_NAME = 'Скачать!';
                }
              }
            }
          });

      })
      .catch(function(err){
        alert('!'+err.message);
      });

  }
  public prepareHtml(html):string{
    let directory = "home";
    try{
      directory = cordova.file.externalDataDirectory;
    }catch (err){

    }
    return html.replace("%rootDir%",directory);
  }

  public gameClick(game){
    //let db = new DatabaseEngine();
    let session = localStorage.getItem("SID");
    if (session == null) {
      session = "";
    }
    if(session==""){
      this.showInfo = true;
      this.footerType = 'REGISTER';
      //let childComponent = this.compFactoryResolver.resolveComponentFactory(ChildComponent);
      //this.footerText.createComponent(childComponent);
      /*this.footerText = '<a ion-item (click)='+"'"+'returnToLogin()'+"'"+'>' +
        'Зарегистрируйтесь</a> для продолжения!';*/
      this.footerClass = "errorFooter";
      setTimeout(() =>{
        this.footerClass = "hiddenFooter";
      }, 3000);
      return;
    }

    if(game.DOWNLOADED == 1){
      try {
        this.navCtrl.push(GamePage, {"GAME": game._ID});
      }catch(err) {
        alert(err);
      }
    }else {

      if (game.PRICE == 0 || game.PAID == 1) {
        this.download(game._ID);
      } else {
        if (game.PAID == 0) {
          this.makePayment(game._ID, game.REAL_PRICE.toFixed(0));
        }
      }
    }

    // alert(game._ID);
  }

  private makePayment(gameId, price){
    let main = this;
    let session = localStorage.getItem("SID");
    let yandexPayment = new YandexPayment(main.http, session, gameId, price);
    yandexPayment.makePayment()
      .then(function(){
        main.loadGameList();
      })
  }
  public download(gameId){
    //alert('dwld:'+gameId);
    let main = this;
    let session = localStorage.getItem("SID");
    main.footerClass = "logFooter";
    main.footerType = "DOWNLOADLOG";
    let gameDownloader = new GameDownloader(gameId, session, main.http);
    let loader = this.loadingCtrl.create({
      content: "Loading..."
    });
    loader.present();
    main.downloadGameFiles(gameId)
      .then(function(){
        main.footerText = "Загрузка заданий...";
        return gameDownloader.downloadTasks();
      })
      .then(function(){
        main.footerText = "Загрузка кодов...";
        return gameDownloader.loadCodes();
      })
      .then(function(){
        main.footerText = "Загрузка кодов...";
        return gameDownloader.loadSimilarCodes();
      })
      .then(function () {
        main.footerText = "Загрузка порядка заданий...";
        return gameDownloader.loadTaskOrder();
      })
      .then(function () {
        main.footerText = "Загрузка подсказкок...";
        return gameDownloader.loadHints();
      })
      .then(function () {
        main.footerText = "Загрузка информации по игре...";
        return gameDownloader.downloadGame();
      })
      .then(function(){
        setTimeout(() =>{
          main.footerClass = "hiddenFooter";
          main.loadGameList();
        }, 1000);
        loader.dismiss();
      })
      .catch(function(err){
        main.footerClass = "errorFooter";
        setTimeout(() =>{
          main.footerClass = "hiddenFooter";
          main.loadGameList();
        }, 1000);
        loader.dismiss();
        main.footerText = err;
      });
  }
  public downloadGameFiles(gameId) {
    // alert("gameFile");
    let main = this;
    return new Promise(function (resolve, reject) {
      main.footerText = "Идет загрузка... Игровые файлы";
      AjaxEngine.call(main.http,
        "GET",
        Consts.const_cgi +"getGameFiles/"+gameId,
        {}).then(function (res) {
        let result = (<any>res);
        let step = 0;
        if (result.length == 0){
          resolve("SUCCESS");
          return;
        }
        try {
          for (let i = 0; i < result.length; i = i + 1) {
            let extDirectory = cordova.file.externalDataDirectory;
            let chain = Promise.resolve();

            chain = chain.then(function () {
              let fileName = result[i]["FILE_NAME"];
              return FileDownloader.checkFile(extDirectory + gameId + "/", fileName)
                .then(function (fileExists) {
                  if (fileExists == 1) {
                    return Promise.resolve();
                  } else {
                    let fileTransfer = new Transfer();
                    let fileName = result[i]["FILE_NAME"];
                    let fileFrom = Consts.uploadFolder+ gameId+"/" + fileName;
                    return fileTransfer.download(fileFrom, extDirectory + gameId+"/" + fileName);
                  }
                }).then(function(res){
                  return Promise.resolve();
                })
            })
              .then(function () {
                main.footerText = "Идет загрузка... Игровые файлы " + step + " из "+result.length;
                FileDownloader.checkFile(extDirectory + gameId+"/", result[step]["FILE_NAME"]).then(
                  function(res){
                  }
                );
                step = step + 1;
                if (step == result.length) {
                  resolve("SUCCESS");
                }
              })
              .catch (function(err){
                alert(err);
                step == result.length;
                reject("Ошибка загрузки файлов");
              });


          }
        } catch (err) {
          reject("Ошибка загрузки файлов");
        }
      }).catch(function (err) {
        console.log(err);
        reject("Ошибка загрузки файлов");
      });
    });
  }
  public returnToLogin(){
    this.navCtrl.push(LoginPage);
  }
}
