"use strict";
/**
 * Created by semak on 14.03.17.
 */
var GameEngine = (function () {
    function GameEngine() {
    }
    GameEngine.getRealCode = function (db, taskId, codeValue) {
        return db.executeSelect("select * " +
            "from SIMILAR_CODE " +
            "where TASK_ID = ? and CODE = ?", [taskId, codeValue]);
    };
    GameEngine.getCode = function (db, taskId, codeValue) {
        var sqlCode = "SELECT * " +
            "  FROM CODE " +
            " WHERE TASK_ID = ?" +
            "   AND _VALUE = ?";
        return db.executeSelect(sqlCode, [taskId, codeValue]);
    };
    GameEngine.checkCodeDone = function (db, taskId, codeId) {
        var main = this;
        return new Promise(function (resolve) {
            var sql = "SELECT * FROM CHECKED_CODE WHERE _ID = ?";
            db.executeSelect(sql, [codeId])
                .then(function (result) {
                if (result.length > 0) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    };
    GameEngine.setCodeDone = function (db, taskId, codeId) {
        var sql = "INSERT INTO CHECKED_CODE(" +
            "_ID, _DATE, TASK_ID) VALUES (?, ?, ?)";
        return db.executeScript(sql, [codeId, new Date(), taskId]);
    };
    GameEngine.doCode = function (db, taskId, codeValue) {
        var main = this;
        var code;
        return new Promise(function (resolve, reject) {
            main.getCode(db, taskId, codeValue)
                .then(function (result) {
                code = result[0];
                return main.checkCodeDone(db, taskId, code["_ID"]);
            })
                .then(function (res) {
                if (res == 1) {
                    alert("done:" + res);
                    reject(-1);
                }
                else {
                    return main.setCodeDone(db, taskId, code["_ID"]);
                }
            })
                .then(function () {
                resolve("SUCCESS");
            });
        });
    };
    GameEngine.checkCode = function (db, taskId, codeValue) {
        var main = this;
        return new Promise(function (resolve, reject) {
            main.getRealCode(db, taskId, codeValue)
                .then(function (result) {
                if (result.length == 0) {
                    reject(0);
                }
                else {
                    var realCodeValue = result[0]["REAL_CODE"];
                    return main.doCode(db, taskId, realCodeValue);
                }
            })
                .then(function () {
                resolve("SUCCESS");
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    GameEngine.checkTaskDone = function (db, taskId) {
        return new Promise(function (resolve) {
            var sqlCheckedCodes = "SELECT COUNT(_ID) CODE2FIND FROM CHECKED_CODE WHERE TASK_ID = ?";
            var codeChecked;
            db.executeSelect(sqlCheckedCodes, [taskId])
                .then(function (res) {
                codeChecked = res[0]["CODE2FIND"];
                var sqlCode2Find = "SELECT * FROM TASK WHERE _ID = ?";
                return db.executeSelect(sqlCode2Find, [taskId]);
            })
                .then(function (res) {
                var code2Find = res[0]["CODE2FIND"];
                if (codeChecked >= code2Find) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    };
    GameEngine.setTaskDone = function (db, taskId) {
        var sql = "UPDATE GAME_ORDER SET DONE = 1 WHERE TASK_ID = ?";
        return db.executeScript(sql, [taskId]);
    };
    GameEngine.resetGame = function (db, gameId) {
        return new Promise(function (resolve) {
            db.executeScript("UPDATE GAME_ORDER " +
                "SET DONE = 0 " +
                "WHERE TASK_ID in " +
                "(SELECT _ID FROM TASK WHERE GAME_ID = ?)", [gameId])
                .then(function () {
                db.executeScript("UPDATE HINT " +
                    "SET USED = 0 " +
                    "WHERE TASK_ID in " +
                    "(SELECT _ID FROM TASK WHERE GAME_ID = ?)", [gameId]);
            })
                .then(function () {
                db.executeScript("DELETE FROM CHECKED_CODE " +
                    "WHERE TASK_ID in " +
                    "(SELECT _ID FROM TASK WHERE GAME_ID = ?)", [gameId]);
            })
                .then(function () {
                resolve("SUCCESS");
            });
        });
    };
    return GameEngine;
}());
exports.GameEngine = GameEngine;
