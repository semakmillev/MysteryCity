"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var ionic_native_1 = require("ionic-native");
var AjaxEngine_1 = require("../../scripts/AjaxEngine");
var Consts_1 = require("../../scripts/Consts");
var game_list_1 = require("../game-list/game-list");
/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var LoginPage = (function () {
    function LoginPage(navCtrl, navParams, http, menu) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.http = http;
        this.menu = menu;
        // let browser = new InAppBrowser();
        this.menu.swipeEnable(false, "mainMenu");
        var session = localStorage.getItem("SID");
        if (session != null) {
            this.passlogin();
        }
    }
    LoginPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad LoginPage');
    };
    LoginPage.prototype.loginvk = function () {
        var html = "https://oauth.vk.com/authorize?client_id=5769214" +
            "&redirect_uri=close.html" +
            "&response_type=token";
        var main = this;
        var promiseVK = new Promise(function (resolve, reject) {
            try {
                var browser_1 = new ionic_native_1.InAppBrowser(html, '_blank', 'location=no');
                browser_1.on("loadstart").subscribe(function (event) {
                    if (browser_1 != undefined) {
                        var url = event.url.toString();
                        if (url.indexOf("access_token") > 0) {
                            var userId = url.split("&")[2].replace("user_id=", "");
                            browser_1.close();
                            resolve(userId);
                        }
                    }
                });
            }
            catch (err) {
                reject(1877590);
            }
        });
        promiseVK
            .then(function (res) {
            return new Promise(function (resolve, reject) {
                AjaxEngine_1.AjaxEngine.call(main.http, "GET", 'https://api.vk.com/method/users.get', { 'user_ids': res })
                    .then(function (o) {
                    resolve(o);
                }).catch(function (err) {
                    reject("Ошибка загрузки информации.");
                    console.log(err);
                    //           alert('fffff'+xhr.responseText+' '+errorThrown);
                });
            });
        })
            .then(function (res) {
            return new Promise(function (resolve, reject) {
                AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi + "TaskLoader.py", {
                    'functionName': 'main_login',
                    'source': 'VK',
                    'user_id': res["response"][0]["uid"],
                    'user_name': res["response"][0]["first_name"] + " " + res["response"][0]["last_name"]
                }).then(function (o) {
                    if (o != "" && o != undefined && o != "undefined") {
                        // window.localStorage.setItem("SID", o);
                        // window.localStorage.setItem("LOGIN", login);
                        localStorage.setItem("SID", o);
                        //$.mobile.changePage("#gamePage", {transition: "slide"});
                        resolve(o);
                    }
                    else {
                        reject("Не удалось пройти авторизацию!");
                    }
                }).catch(function (err) {
                    reject("Ошибка авторизации.");
                    console.log(err);
                    //           alert('fffff'+xhr.responseText+' '+errorThrown);
                });
            });
        })
            .then(function (res) {
            main.passlogin();
        })
            .catch(function (err) {
            alert('Err:' + err);
            //Login.showLoginError(err);
        });
    };
    LoginPage.prototype.loginfb = function () {
        var html = "https://www.facebook.com/v2.8/dialog/oauth?client_id=119426481881594&" +
            "response_type=token&redirect_uri=" +
            "https://www.facebook.com/connect/login_success.html";
        var main = this;
        var promiseFB = new Promise(function (resolve, reject) {
            var browser = new ionic_native_1.InAppBrowser(html, '_blank', 'location=no');
            browser.on("loadstart").subscribe(function (event) {
                var url = event.url.toString();
                if (url.indexOf("access_token") > 0) {
                    var token = url.split("#")[1].split("&")[0].replace("access_token=", "");
                    AjaxEngine_1.AjaxEngine.call(main.http, "GET", "https://graph.facebook.com/me", { 'access_token': token })
                        .then(function (o) {
                        browser.close();
                        resolve(o);
                    });
                }
            });
        });
        promiseFB.then(function (res) {
            return AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi + "TaskLoader.py", {
                'functionName': 'main_login',
                'source': 'FB',
                'user_id': res["id"],
                'user_name': res["name"]
            })
                .then(function (res) {
                localStorage.setItem("SID", res);
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
    };
    LoginPage.prototype.passlogin = function () {
        this.navCtrl.push(game_list_1.GameListPage);
    };
    LoginPage = __decorate([
        core_1.Component({
            selector: 'page-login',
            templateUrl: 'login.html'
        })
    ], LoginPage);
    return LoginPage;
}());
exports.LoginPage = LoginPage;
