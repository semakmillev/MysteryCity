import { Component } from '@angular/core';
import {NavController, NavParams, IonicApp, MenuController} from 'ionic-angular';
import {InAppBrowser} from "ionic-native";
import {Http} from "@angular/http";
import {AjaxEngine} from "../../scripts/AjaxEngine";
import {Consts} from "../../scripts/Consts";
import {GameListPage} from "../game-list/game-list";
import {VK, Facebook } from "ng2-cordova-oauth/core";
import {OauthCordova} from 'ng2-cordova-oauth/platform/cordova';
/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public oauth : OauthCordova;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, private menu: MenuController) {
    // let browser = new InAppBrowser();
    this.menu.swipeEnable(false,"mainMenu");
    let session = localStorage.getItem("SID");
    if (session != null && session != "" && session != undefined) {
      this.passlogin();
    }
    this.oauth = new OauthCordova();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  public loginvk() {
    let provider = new VK({
      clientId: "5769214",
      appScope: ["email"]
    });
    let main = this;
    let promiseVK = new Promise(function (resolve, reject) {
      main.oauth.login(provider).then((success) => {
        resolve(success["user_id"])
      });
    });
    promiseVK
      .then(function (res) {
        return new Promise(function(resolve, reject){
          AjaxEngine.call(main.http, "GET", 'https://api.vk.com/method/users.get', {'user_ids': res}
          )
            .then(function(o){
              resolve(o);
            }).catch(function (err) {
            reject("Ошибка загрузки информации.");
            console.log(err);
            //           alert('fffff'+xhr.responseText+' '+errorThrown);
          })
        })
      })
      .then(function (res) {
        return new Promise(function (resolve, reject) {
          AjaxEngine.call(main.http, "POST", Consts.const_cgi+ "login/main_login",{
            'source': 'VK',
            'user_id': res["response"][0]["uid"],
            'user_name': res["response"][0]["first_name"]+" "+res["response"][0]["last_name"]
          }).then(function (o) {
            if (o != "" && o != undefined && o != "undefined") {
              // window.localStorage.setItem("SID", o);
              // window.localStorage.setItem("LOGIN", login);
              localStorage.setItem("SID", (<any>o));
              //$.mobile.changePage("#gamePage", {transition: "slide"});
              resolve(o);
            } else {
              reject("Не удалось пройти авторизацию!");
            }
          }).catch(function (err) {
            reject("Ошибка авторизации.");
            console.log(err);
            //           alert('fffff'+xhr.responseText+' '+errorThrown);
          })
        });
      })
      .then(function (res) {
        main.passlogin();
      })
      .catch(function (err) {
        alert('Err:'+err);
        //Login.showLoginError(err);
      });
  }
  public loginvk_(){
    let html = "https://oauth.vk.com/authorize?client_id=5769214" +
      "&redirect_uri=close.html" +
      "&response_type=token";
    let main = this;

    let promiseVK = new Promise(function (resolve, reject) {
      try {
        let browser = new InAppBrowser(html,'_blank','location=no, clearsessioncache=yes');
        browser.executeScript({code:"document.activeElement.blur();"});
          browser.on("loadstart").subscribe(
            (event) => {
              if (browser != undefined) {
                let url = event.url.toString();
                if (url.indexOf("access_token") > 0) {
                  let userId = url.split("&")[2].replace("user_id=", "");
                  browser.close();
                  resolve(userId);
                  //Loader.loadGameList();
                }
              }
            });
      }catch (err){
        reject(1877590);
      }
    });
    promiseVK
      .then(function (res) {
        return new Promise(function(resolve, reject){
          AjaxEngine.call(main.http, "GET", 'https://api.vk.com/method/users.get', {'user_ids': res}
            )
            .then(function(o){
            resolve(o);
          }).catch(function (err) {
            reject("Ошибка загрузки информации.");
            console.log(err);
            //           alert('fffff'+xhr.responseText+' '+errorThrown);
          })
        })
      })
      .then(function (res) {
        return new Promise(function (resolve, reject) {
          AjaxEngine.call(main.http, "GET", Consts.const_cgi+ "login/main_login",{
            'source': 'VK',
            'user_id': res["response"][0]["uid"],
            'user_name': res["response"][0]["first_name"]+" "+res["response"][0]["last_name"]
          }).then(function (o) {
            if (o != "" && o != undefined && o != "undefined") {
              // window.localStorage.setItem("SID", o);
              // window.localStorage.setItem("LOGIN", login);
              localStorage.setItem("SID", (<any>o));
              //$.mobile.changePage("#gamePage", {transition: "slide"});
              resolve(o);
            } else {
              reject("Не удалось пройти авторизацию!");
            }
          }).catch(function (err) {
            reject("Ошибка авторизации.");
            console.log(err);
            //           alert('fffff'+xhr.responseText+' '+errorThrown);
          })
        });
      })
      .then(function (res) {
        main.passlogin();
      })
      .catch(function (err) {
        alert('Err:'+err);
        //Login.showLoginError(err);
      });
  }
  public loginfb() {
    let provider = new Facebook({
      clientId: "119426481881594",
      appScope: ["email"]
    });
    let main = this;
    let promiseFB = new Promise(function (resolve, reject) {
      main.oauth.login(provider).then((success) => {
        resolve(success["access_token"])
      });
    });
    promiseFB
      .then(function (res) {
        return AjaxEngine.call(main.http, "GET", "https://graph.facebook.com/me", {'access_token': res})
      })
      .then(function(res){
        return AjaxEngine.call(main.http, "GET",
          Consts.const_cgi+ "login/main_login",
          {'source': 'FB',
           'user_id': res["id"],
           'user_name': res["name"]
          })

      })
      .then(function(res){
        localStorage.setItem("SID", (<any> res));
        main.passlogin();
      });
  }
  public loginfb_(){
    let html = "https://www.facebook.com/v2.8/dialog/oauth?client_id=119426481881594&" +
      "response_type=token&redirect_uri=" +
      "https://www.facebook.com/connect/login_success.html";
    let main = this;

    let promiseFB = new Promise(function(resolve , reject) {
      let browser = new InAppBrowser(html, '_blank', 'location=no, clearsessioncache=yes');
      browser.executeScript({code: "document.activeElement.blur();"});
      browser.on("loadstart").subscribe(
        (event) => {
          let url = event.url.toString();
          if (url.indexOf("access_token") > 0) {
            let token = url.split("#")[1].split("&")[0].replace("access_token=", "");
            AjaxEngine.call(main.http, "GET", "https://graph.facebook.com/me", {'access_token': token})
              .then(function (o) {
                browser.close();
                resolve(o);
              });

          }
        }
      );
    });
    promiseFB.then(function (res) {
      return AjaxEngine.call(main.http, "POST",
          Consts.const_cgi + "login/main_login", {
            'source': 'FB',
            'user_id': res["id"],
            'user_name': res["name"]
          })
        .then(function(res){
          localStorage.setItem("SID", (<any> res));
          main.passlogin();
        });
    });
    /*
    var promiseFB = new Promise(function(resolve , reject) {
        let ref;
        if (ref != undefined) {
          var url = event.url.toString();
          if (url.indexOf("access_token") > 0) {
            var token = url.split("#")[1].split("&")[0].replace("access_token=", "");
            $.ajax({
                url: "https://graph.facebook.com/me",
                data: {access_token: token}
              }
            ).done(function (o) {
              resolve(o);

            }).fail(function (xhr, textStatus, errorThrown) {
              reject("Ошибка авторизации.");
              console.log(xhr.responseText + ' ' + errorThrown);
              //           alert('fffff'+xhr.responseText+' '+errorThrown);
            });
            ref.close();

          }
          //$.ajax("https://graph.facebook.com/me")
          //?access_token=
          // alert(placeToken);
        }


      });
    });

    promiseFB
      .then(function(res){
        return new Promise(function(resolve, reject){
          $.ajax({
              url: const_cgi + "TaskLoader.py",
              data: {
                functionName: 'main_login',
                source: 'FB',
                user_id: res["id"],
                user_name: res["name"]
              }
            }
          ).done(function (o) {
            if (o != "" && o != undefined && o != "undefined") {
              // window.localStorage.setItem("SID", o);
              // window.localStorage.setItem("LOGIN", login);
              resolve(o);
            } else {
              reject("Не удалось пройти авторизацию!");
            }
          }).fail(function (xhr, textStatus, errorThrown) {
            reject("Ошибка авторизации.");
            console.log(xhr.responseText + ' ' + errorThrown);
            //           alert('fffff'+xhr.responseText+' '+errorThrown);
          })
        });
      })
      .then(function (res) {
        window.localStorage.setItem("SID", res);
        $.mobile.changePage("#gamePage", {transition: "slide"});
      })
      .catch(function (err) {
        Login.showLoginError(err);
      });
    */
  }
  public passlogin(){
    this.navCtrl.push(GameListPage);
  }
}
