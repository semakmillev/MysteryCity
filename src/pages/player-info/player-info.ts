import { Component } from '@angular/core';
import {NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import {LoginPage} from "../login/login";
import {Http} from "@angular/http";
import {AjaxEngine} from "../../scripts/AjaxEngine";
import {Consts} from "../../scripts/Consts";
import {DatabaseEngine} from "../../scripts/DatabaseEngine";

/*
  Generated class for the PlayerInfo page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-player-info',
  templateUrl: 'player-info.html'
})
export class PlayerInfoPage {
  public userName : string;
  public userLogin;
  public eMail;
  private codes;
  private promoCodeValue;
  private loadingController: LoadingController;
  constructor(public navCtrl: NavController, public navParams: NavParams, private http : Http,
              private alertCtrl: AlertController) {
    this.refreshInfo();

  }
  private showAlert(title, text) {
    let al = this.alertCtrl.create({title: title, message: text, buttons: ['OK']});
    al.present();
  }
  private setCodeClick(){
    let main = this;
    let promoCode = main.promoCodeValue;
    let SID = localStorage.getItem("SID");
    AjaxEngine.call(main.http,
      "POST", Consts.const_cgi + "login/setDiscount",
      {functionName: "updateLogin",
        SID: SID,
        code: promoCode
      })
      .then(function(res){
        let result = (<string>res);
        if(result == '0'){
          main.showAlert('Увы!','Код уже использован кем-то другим');
        }
        if(res == '-1'){
          main.showAlert('Увы!','Такого кода не существует');
        }
        if(res == '1'){
          main.showAlert('Ура!', 'Код введён');
          main.refreshCodes();
        }
      });
  }
  private refreshCodes(){
    let main = this;
    let SID = localStorage.getItem("SID");
    AjaxEngine.call(main.http, "GET", Consts.const_cgi + "login/getPromoCodes",
      {
        SID: SID
      })
      .then(function (res) {
        let result = (<any> res);
        for (let i = 0; i < result.length; i++) {
          let game = result[i]["_NAME"];

          if (game == "Все игры") {
            result[i]["_NAME"] = "все игры";
          } else {
            result[i]["_NAME"] = 'игру "' + game + '"';
          }
        }
        main.codes = result;
      });
  }
  private refreshInfo(){
    let SID = localStorage.getItem("SID");
    if (SID == "" || SID == undefined || SID == "undefined") {
      this.navCtrl.push(LoginPage);
      return;
    }
    let main = this;
    AjaxEngine.call(main.http, "GET", Consts.const_cgi + "login/getUserInfo",
      {
        SID: SID
      })
      .then(function (res) {
        main.userName = res["_NAME"];
        if(res["_CODE"]=="None") {
          main.userLogin = "";
        }else
        {
          main.userLogin = res["_CODE"];
        }
        if(res["EMAIL"]=="None") {
          main.eMail = "";
        }else
        {
          main.eMail = res["EMAIL"];
        }
        main.refreshCodes();
      });
  }
  private saveLoginInfo(){
    let main = this;
    let SID = localStorage.getItem("SID");
    try {
      let loader = main.loadingController.create({content: "Пожалуйста, подождите..."});
      loader.present();
    }catch (err){
    }
    AjaxEngine.call(main.http,
                    "GET",
                    Consts.const_cgi + "login/updateLogin",
                    { SID: SID,
                      email: main.eMail,
                      nick: main.userLogin})
      .then(function(){
        main.refreshInfo();
        //loader.dismiss();

      })
      .catch(function(){
        main.showAlert("Упс!", "Что-то пошло не так!");
        //loader.dismiss();
      });

  }
  private logout(){
    localStorage.setItem("SID","");
    let db = new DatabaseEngine();
    let main = this;
    db.clearTables()
      .then(function () {
        main.navCtrl.push(LoginPage);
      });
    }
}
