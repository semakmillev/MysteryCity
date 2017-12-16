"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var AjaxEngine_1 = require("../../scripts/AjaxEngine");
var Consts_1 = require("../../scripts/Consts");
var DatabaseEngine_1 = require("../../scripts/DatabaseEngine");
var login_1 = require("../login/login");
var FileDownloader_1 = require("../../scripts/FileDownloader");
var ionic_native_1 = require("ionic-native");
var GameDownloader_1 = require("../../scripts/GameDownloader");
var game_1 = require("../game/game");
var YandexPayment_1 = require("../../scripts/YandexPayment");
var GameListPage = (function () {
    function GameListPage(navCtrl, navParams, http, menu) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.http = http;
        this.menu = menu;
        this.showInfo = false;
        this.footerClass = "hiddenFooter";
        this.loadGameList();
        this.menu.swipeEnable(true, "mainMenu");
    }
    GameListPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad GameListPage');
    };
    GameListPage.prototype.loadGameList = function () {
        var session = localStorage.getItem("SID");
        var main = this;
        if (session == null) {
            session = "";
        }
        //$.mobile.loading('show', {});
        var db = new DatabaseEngine_1.DatabaseEngine();
        db.executeSelect("SELECT * FROM GAME", [])
            .then(function (res) {
            main.downloadedGames = res;
            for (var i = 0; i < main.downloadedGames; i++) {
            }
            //alert(main.downloadedGames);
            AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi + "TaskLoader.py", {
                "functionName": "getGamesTest",
                "SID": session
            })
                .then(function (res) {
                main.games = res;
                var _loop_1 = function(i) {
                    if (main.downloadedGames.filter(function (obj) { return obj._ID == main.games[i]._ID; }).length > 0) {
                        main.games[i].BUTTON_NAME = 'Играть!';
                        main.games[i].DOWNLOADED = 1;
                    }
                    else {
                        console.log(main.games[i].PAID);
                        main.games[i].DOWNLOADED = 0;
                        if (main.games[i].PAID == 0 && main.games[i].PRICE > 0) {
                            main.games[i].BUTTON_NAME = 'Купить (' + main.games[i].PRICE + ' р.)';
                        }
                        else {
                            main.games[i].BUTTON_NAME = 'Скачать!';
                        }
                    }
                };
                for (var i = 0; i < main.games.length; i++) {
                    _loop_1(i);
                }
            });
        })
            .catch(function (err) {
            alert(err);
        });
    };
    GameListPage.prototype.prepareHtml = function (html) {
        var directory = "home";
        try {
            directory = cordova.file.externalDataDirectory;
        }
        catch (err) {
        }
        return html.replace("%rootDir%", directory);
    };
    GameListPage.prototype.gameClick = function (game) {
        var _this = this;
        //let db = new DatabaseEngine();
        var session = localStorage.getItem("SID");
        if (session == null) {
            session = "";
        }
        if (session == "") {
            this.showInfo = true;
            this.footerType = 'REGISTER';
            //let childComponent = this.compFactoryResolver.resolveComponentFactory(ChildComponent);
            //this.footerText.createComponent(childComponent);
            /*this.footerText = '<a ion-item (click)='+"'"+'returnToLogin()'+"'"+'>' +
              'Зарегистрируйтесь</a> для продолжения!';*/
            this.footerClass = "errorFooter";
            setTimeout(function () {
                _this.footerClass = "hiddenFooter";
            }, 3000);
            return;
        }
        if (game.DOWNLOADED == 1) {
            try {
                this.navCtrl.push(game_1.GamePage, { "GAME": game._ID });
            }
            catch (err) {
                alert(err);
            }
        }
        else {
            if (game.PRICE == 0) {
                this.download(game._ID);
            }
            else {
                if (game.PAID == 0) {
                    this.makePayment(game._ID, game.PRICE);
                }
            }
        }
        // alert(game._ID);
    };
    GameListPage.prototype.makePayment = function (gameId, price) {
        var main = this;
        var session = localStorage.getItem("SID");
        var yandexPayment = new YandexPayment_1.YandexPayment(this.http, session, gameId, price);
        yandexPayment.makePayment()
            .then(function () {
            main.loadGameList();
        });
    };
    GameListPage.prototype.download = function (gameId) {
        //alert('dwld:'+gameId);
        var main = this;
        var session = localStorage.getItem("SID");
        main.footerClass = "logFooter";
        main.footerType = "DOWNLOADLOG";
        var gameDownloader = new GameDownloader_1.GameDownloader(gameId, session, main.http);
        main.downloadGameFiles(gameId)
            .then(function () {
            main.footerText = "Загрузка заданий...";
            return gameDownloader.downloadTasks();
        })
            .then(function () {
            main.footerText = "Загрузка кодов...";
            return gameDownloader.loadCodes();
        })
            .then(function () {
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
            .then(function () {
            setTimeout(function () {
                main.footerClass = "hiddenFooter";
                main.loadGameList();
            }, 1000);
        })
            .catch(function (err) {
            main.footerClass = "errorFooter";
            setTimeout(function () {
                main.footerClass = "hiddenFooter";
                main.loadGameList();
            }, 1000);
            alert(err);
            main.footerText = err;
        });
    };
    GameListPage.prototype.downloadGameFiles = function (gameId) {
        // alert("gameFile");
        var main = this;
        return new Promise(function (resolve, reject) {
            main.footerText = "Идет загрузка... Игровые файлы";
            AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi +
                "TaskLoader.py", {
                "functionName": "getGameFiles",
                "gameId": gameId
            }).then(function (res) {
                var result = res;
                var step = 0;
                if (result.length == 0) {
                    resolve("SUCCESS");
                    return;
                }
                try {
                    var _loop_2 = function(i) {
                        var extDirectory = cordova.file.externalDataDirectory;
                        var chain = Promise.resolve();
                        chain = chain.then(function () {
                            var fileName = result[i]["FILE_NAME"];
                            return FileDownloader_1.FileDownloader.checkFile(extDirectory + gameId + "/", fileName)
                                .then(function (fileExists) {
                                if (fileExists == 1) {
                                    return Promise.resolve();
                                }
                                else {
                                    var fileTransfer = new ionic_native_1.Transfer();
                                    var fileName_1 = result[i]["FILE_NAME"];
                                    var fileFrom = Consts_1.Consts.uploadFolder + gameId + "/" + fileName_1;
                                    return fileTransfer.download(fileFrom, extDirectory + gameId + "/" + fileName_1);
                                }
                            }).then(function (res) {
                                alert(res);
                                return Promise.resolve();
                            });
                        })
                            .then(function () {
                            main.footerText = "Идет загрузка... Игровые файлы " + step + " из " + result.length;
                            FileDownloader_1.FileDownloader.checkFile(extDirectory + gameId + "/", result[step]["FILE_NAME"]).then(function (res) {
                                alert(extDirectory + gameId + "/" + result[step]["FILE_NAME"] + ":" + res);
                            });
                            step = step + 1;
                            if (step == result.length) {
                                resolve("SUCCESS");
                            }
                        })
                            .catch(function (err) {
                            alert(err);
                            step == result.length;
                            reject("Ошибка загрузки файлов");
                        });
                    };
                    for (var i = 0; i < result.length; i = i + 1) {
                        _loop_2(i);
                    }
                }
                catch (err) {
                    reject("Ошибка загрузки файлов");
                }
            }).catch(function (err) {
                console.log(err);
                reject("Ошибка загрузки файлов");
            });
        });
    };
    GameListPage.prototype.returnToLogin = function () {
        this.navCtrl.push(login_1.LoginPage);
    };
    GameListPage = __decorate([
        core_1.Component({
            selector: 'page-game-list',
            templateUrl: 'game-list.html',
        })
    ], GameListPage);
    return GameListPage;
}());
exports.GameListPage = GameListPage;
