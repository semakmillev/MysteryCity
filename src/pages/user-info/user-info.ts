import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {LoginPage} from "../login/login";
import {AjaxEngine} from "../../scripts/AjaxEngine";
import {Consts} from "../../scripts/Consts";
import {Http} from "@angular/http";

/*
  Generated class for the UserInfo page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-user-info',
  templateUrl: 'user-info.html'
})
export class UserInfoPage {

  public eMail;
  public userLogin;
  public userName;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http : Http) {
    /*
    let SID = localStorage.getItem("SID");
    if (SID == "" || SID == undefined || SID == "undefined") {
      this.navCtrl.push(LoginPage);
      return;
    }
    let main = this;
    AjaxEngine.call(http, "GET", Consts.const_cgi + "TaskLoader.py",
      {
        functionName: "getUserInfo",
        SID: SID
      })
      .then(function (res) {
        main.userName = res["_NAME"];
        main.userLogin = res["_CODE"];
        main.eMail = res["EMAIL"];
      });
*/
    /*    getUserInfoPromise
     .then(function(res){
     Login.getPromoCodes();
     });
     */
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPagePage');
  }

}
