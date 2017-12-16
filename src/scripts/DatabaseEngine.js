"use strict";
var ionic_native_1 = require("ionic-native");
var sqlTasks = "CREATE TABLE IF NOT EXISTS TASK(" +
    "_ID INTEGER, " +
    "GAME_ID INTEGER, " +
    "_NAME," +
    "_TEXT," +
    "CODE2FIND INTEGER," +
    "DEMO)";
var sqlCodes = "CREATE TABLE IF NOT EXISTS CODE(" +
    "_ID INTEGER primary key NOT NULL  UNIQUE, " +
    "TASK_ID INTEGER, " +
    "_VALUE," +
    "_TYPE)";
var sqlSimilarCode = "CREATE TABLE IF NOT EXISTS SIMILAR_CODE(" +
    "TASK_ID INTEGER, " +
    "CODE," +
    "REAL_CODE)";
var sqlGame = "CREATE TABLE IF NOT EXISTS GAME(_ID INTEGER, _NAME, _COMMENTS, PRICE, PAID," +
    "START_PLACE," +
    "ESTIMATED_TIME_DISTANCE," +
    "DIFFICULTY," +
    "ADDITIONAL_TEXT," +
    "FINISH_PLACE," +
    "POINTS," +
    "NUM_OF_TASKS," +
    "REAL_PRICE," +
    "IMG)";
var sqlCheckedCode = "CREATE TABLE IF NOT EXISTS CHECKED_CODE(" +
    "_ID INTEGER primary key NOT NULL UNIQUE, _DATE, TASK_ID INTEGER);";
var sqlHint = "CREATE TABLE IF NOT EXISTS HINT(" +
    "_ID INTEGER primary key NOT NULL  UNIQUE, " +
    "TASK_ID INTEGER," +
    "HINT_TEXT," +
    "HINT_ORDER," +
    "USED INTEGER)";
var sqlGameOrder = "CREATE TABLE IF NOT EXISTS GAME_ORDER(" +
    "GAME_ID INTEGER, " +
    "TASK_ID INTEGER," +
    "TASK_ORDER INTEGER," +
    "DONE INTEGER)";
var sqlGameImage = "CREATE TABLE IF NOT EXISTS GAME_IMAGE(" +
    "_ID INTEGER, " +
    "FILE_NAME, " +
    "LOADED)";
var DatabaseEngine = (function () {
    function DatabaseEngine() {
        var _this = this;
        this.db = new ionic_native_1.SQLite();
        this.executeScript = function (sql, params) {
            var main = _this;
            return new Promise(function (resolve, reject) {
                main.db.openDatabase({
                    name: "MC.db",
                    location: "default"
                }).then(function () {
                    main.db.executeSql(sql, params).then(function (data) {
                        resolve("SUCCESS");
                    }, function (error) {
                        reject(error);
                    });
                });
            });
        };
        this.executeSelect = function (sql, params) {
            var main = _this;
            return new Promise(function (resolve, reject) {
                main.db.openDatabase({
                    name: "MC.db",
                    location: "default"
                }).then(function () {
                    main.db.executeSql(sql, params).then(function (data) {
                        var result = [];
                        for (var i = 0; i < data.rows.length; i++) {
                            result.push(data.rows.item(i));
                        }
                        resolve(result);
                    }, function (error) {
                        reject(error);
                    });
                });
            });
        };
        this.dropCreateTable = function (tableName, tableScript) {
            //alert(tableScript);
            // return Promise.resolve();
            var main = _this;
            return new Promise(function (resolve) {
                main.executeScript("DROP TABLE " + tableName, [])
                    .then(function () {
                    return main.executeScript(tableScript, []);
                })
                    .catch(function () {
                    return main.executeScript(tableScript, []);
                })
                    .then(function () {
                    return resolve("SUCCESS");
                });
            });
        };
        this.initDatabase = function () {
            //this.dropCreateTable("TASK", sqlTasks);
            var main = _this;
            return new Promise(function (resolve) {
                main.dropCreateTable("TASK", sqlTasks)
                    .then(function () {
                    return main.dropCreateTable("CODE", sqlCodes);
                })
                    .then(function () {
                    return main.dropCreateTable("SIMILAR_CODE", sqlSimilarCode);
                })
                    .then(function () {
                    return main.dropCreateTable("GAME", sqlGame);
                })
                    .then(function () {
                    return main.dropCreateTable("HINT", sqlHint);
                })
                    .then(function () {
                    return main.dropCreateTable("GAME_ORDER", sqlGameOrder);
                })
                    .then(function () {
                    return main.dropCreateTable("CHECKED_CODE", sqlCheckedCode);
                })
                    .then(function () {
                    return main.dropCreateTable("GAME_IMAGE", sqlGameImage);
                })
                    .then(function () {
                    return resolve("SUCCESS");
                });
            });
        };
        this.db.openDatabase({
            name: "MC.db",
            location: "default"
        });
    }
    DatabaseEngine.prototype.loadTable = function (tableName, jsonData) {
        var sql = "INSERT INTO " + tableName + " ";
        var fieldSql = "(";
        var paramSql = "(";
        var values = [];
        for (var i in jsonData) {
            var key = i;
            var val = jsonData[key];
            fieldSql = fieldSql + key + ",";
            paramSql = paramSql + "?,";
            values.push(val.toString());
        }
        fieldSql = fieldSql.substr(0, fieldSql.length - 1) + ")";
        paramSql = paramSql.substr(0, paramSql.length - 1) + ")";
        sql = sql + fieldSql + " VALUES " + paramSql;
        //paramsSql = "("
        return this.executeScript(sql, values);
    };
    ;
    DatabaseEngine.size = function (obj) {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                return obj[key].length;
            }
        }
        return 0;
    };
    return DatabaseEngine;
}());
exports.DatabaseEngine = DatabaseEngine;
