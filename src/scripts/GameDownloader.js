"use strict";
var AjaxEngine_1 = require("./AjaxEngine");
var Consts_1 = require("./Consts");
var DatabaseEngine_1 = require("./DatabaseEngine");
/**
 * Created by semak on 22.02.17.
 */
var GameDownloader = (function () {
    function GameDownloader(gameId, session, http) {
        this.gameId = gameId;
        this.session = session;
        this.http = http;
        this.db = new DatabaseEngine_1.DatabaseEngine();
    }
    GameDownloader.prototype.downloadGame = function () {
        var main = this;
        return new Promise(function (resolve, reject) {
            AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi + "TaskLoader.py", {
                "functionName": "getGame",
                "gameId": main.gameId,
                "session": main.session
            })
                .then(function (res) {
                var result = res;
                main.db.loadTable("GAME", result[0]).then(function () {
                    resolve("SUCCESS");
                });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ;
    //downloadGameFiles
    GameDownloader.prototype.downloadTable = function (functionName, tableName, errorText) {
        var main = this;
        return new Promise(function (resolve, reject) {
            AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi + "TaskLoader.py", {
                "functionName": functionName,
                "gameId": main.gameId
            }).then(function (res) {
                // alert(o.length)
                //JSON.parse(o);
                //alert("downloaded gameTask");
                var result = res;
                alert(result.length);
                var chain = Promise.resolve();
                var steps = 1;
                var _loop_1 = function(i) {
                    chain = chain.then(function () {
                        main.db.loadTable(tableName, result[i]).then(function () {
                            steps++;
                            if (steps == result.length) {
                                resolve("SUCCESS");
                            }
                        });
                    });
                };
                for (var i = 0; i < result.length; i = i + 1) {
                    _loop_1(i);
                }
            }).catch(function (err) {
                console.log('Error:' + err);
                reject(errorText);
            });
        });
    };
    GameDownloader.prototype.downloadTasks = function () {
        return this.downloadTable("getTasks", "TASK", "Ошибка загрузки заданий");
    };
    ;
    GameDownloader.prototype.loadSimilarCodes = function () {
        return this.downloadTable("getSimilarCodes", "SIMILAR_CODE", "Ошибка загрузки кодов");
    };
    ;
    GameDownloader.prototype.loadCodes = function () {
        return this.downloadTable("getCodes", "CODE", "Ошибка загрузки кодов");
    };
    GameDownloader.prototype.loadHints = function () {
        return this.downloadTable("getHints", "HINT", "Ошибка загрузки подсказок");
    };
    GameDownloader.prototype.loadTaskOrder = function () {
        return this.downloadTable("getGameOrder", "GAME_ORDER", "Ошибка загрузки порядка заданий");
    };
    return GameDownloader;
}());
exports.GameDownloader = GameDownloader;
