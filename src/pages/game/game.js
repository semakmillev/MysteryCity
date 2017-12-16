"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var DatabaseEngine_1 = require("../../scripts/DatabaseEngine");
var GameEngine_1 = require("../../scripts/GameEngine");
var Consts_1 = require("../../scripts/Consts");
var AjaxEngine_1 = require("../../scripts/AjaxEngine");
var GamePage = (function () {
    function GamePage(navCtrl, navParams, http, alertCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.http = http;
        this.alertCtrl = alertCtrl;
        var main = this;
        main.gameId = navParams.get("GAME");
        main.db = new DatabaseEngine_1.DatabaseEngine();
        main.getCurrentTask();
    }
    GamePage.prototype.prepareHtml = function (html) {
        var directory = "home";
        try {
            directory = cordova.file.externalDataDirectory + "/" + this.gameId;
        }
        catch (err) {
        }
        return html.replace("%rootDir%", directory);
    };
    GamePage.prototype.getCurrentTask = function () {
        var sql = "select t.* " +
            "  from GAME_ORDER go, TASK t" +
            "  where 1=1" +
            "    and go.DONE = 0" +
            "    and go.TASK_ID = t._ID" +
            "    and go.GAME_ID = ?" +
            "  order by go.task_order";
        var main = this;
        return main.db.executeSelect(sql, [main.gameId])
            .then(function (res) {
            var result = res[0];
            main.currentTask = result;
            main.getCodes().then(function (res) {
                var codes = res;
                main.codeType = "SIMPLE";
                main.codeValue = "";
                for (var i = 0; i < codes.length; i++) {
                    if (codes[i]._VALUE == "TECH_NEXT") {
                        main.codeValue = "TECH_NEXT";
                        break;
                    }
                }
                for (var i = 0; i < codes.length; i++) {
                    if (codes[i]._VALUE == "TECH_FINISH") {
                        main.codeValue = "TECH_FINISH";
                        break;
                    }
                }
            });
            main.taskHtml = main.prepareHtml(result._TEXT);
            main.getHintHtml();
        })
            .catch(function (err) {
            alert(err);
        });
    };
    GamePage.prototype.getHintHtml = function () {
        var sqlHint = "SELECT * FROM HINT WHERE TASK_ID = ? AND USED = 1";
        var main = this;
        main.db.executeSelect(sqlHint, [main.currentTask._ID]).then(function (res) {
            main.hints = res;
        });
    };
    GamePage.prototype.takeHint = function () {
        var main = this;
        this.showCheckDialog("Подсказка", "Вы точно хотите, чтобы вам подсказали?").then(function (res) {
            if (res == 1) {
                var sql = "SELECT * FROM HINT WHERE TASK_ID = ? AND USED = 0 ORDER BY _ID";
                // WHERE TASK_ID = ? AND USED = 0 ORDER BY HINT_ORDER
                main.db.executeSelect(sql, [main.currentTask._ID])
                    .then(function (res) {
                    if (res.length > 0) {
                        var result = res[0];
                        var id = result._ID;
                        var sqlUpdate = "UPDATE HINT SET USED = 1 WHERE _ID = ?";
                        main.db.executeScript(sqlUpdate, [id])
                            .then(function () {
                            main.getHintHtml();
                        })
                            .catch(function (err) {
                            alert(err);
                        });
                    }
                });
            }
        });
    };
    GamePage.prototype.showCheckDialog = function (title, text) {
        var main = this;
        return new Promise(function (resolve) {
            var confirm = main.alertCtrl.create({
                title: title,
                message: text,
                buttons: [
                    {
                        text: 'Да',
                        handler: function () { resolve(1); }
                    },
                    {
                        text: 'Нет',
                        handler: function () { resolve(0); }
                    }]
            });
            confirm.present();
        });
    };
    GamePage.prototype.getCodes = function () {
        var main = this;
        return main.db.executeSelect("SELECT * FROM CODE WHERE TASK_ID = ?", [main.currentTask._ID]);
    };
    GamePage.prototype.checkCodeClick = function () {
        var codeValue = this.inputCodeValue;
        this.checkCode(codeValue);
    };
    GamePage.prototype.checkCode = function (codeValue) {
        alert(codeValue);
        var main = this;
        GameEngine_1.GameEngine.checkCode(this.db, this.currentTask._ID, codeValue)
            .then(function (res) {
            GameEngine_1.GameEngine.checkTaskDone(main.db, main.currentTask._ID)
                .then(function (res) {
                if (res == 1) {
                    GameEngine_1.GameEngine.setTaskDone(main.db, main.currentTask._ID)
                        .then(function () {
                        main.getCurrentTask();
                    });
                }
            });
        })
            .catch(function (err) {
            alert(err);
            GameEngine_1.GameEngine.checkTaskDone(main.db, main.currentTask._ID)
                .then(function (res) {
                if (res == 1) {
                    GameEngine_1.GameEngine.setTaskDone(main.db, main.currentTask._ID)
                        .then(function () {
                        main.getCurrentTask();
                    });
                }
            });
        });
    };
    GamePage.prototype.setRating = function () {
        var rate = this.rate;
        var gameId = this.gameId;
        var main = this;
        var session = localStorage.getItem("SID");
        AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi +
            "TaskLoader.py", {
            "functionName": "setRating",
            "gameId": gameId,
            "SID": session,
            "rating": rate
        });
    };
    GamePage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad GamePage');
    };
    GamePage = __decorate([
        core_1.Component({
            selector: 'page-game',
            templateUrl: 'game.html'
        })
    ], GamePage);
    return GamePage;
}());
exports.GamePage = GamePage;
