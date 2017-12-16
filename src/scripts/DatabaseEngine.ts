import {SQLite} from "ionic-native";

var sqlTasks  : string = "CREATE TABLE IF NOT EXISTS TASK("+
  "_ID INTEGER, "+
  "GAME_ID INTEGER, "+
  "_NAME,"+
  "_TEXT," +
  "CODE2FIND INTEGER," +
  "DEMO)";

var sqlCodes  : string = "CREATE TABLE IF NOT EXISTS CODE("+
  "_ID INTEGER primary key NOT NULL  UNIQUE, "+
  "TASK_ID INTEGER, " +
  "_VALUE," +
  "_TYPE)";

var sqlSimilarCode  : string = "CREATE TABLE IF NOT EXISTS SIMILAR_CODE("+
  "TASK_ID INTEGER, " +
  "CODE," +
  "REAL_CODE)";

var sqlGame  : string = "CREATE TABLE IF NOT EXISTS GAME(_ID INTEGER, _NAME, _COMMENTS, PRICE, PAID,"+
  "START_PLACE,"+
  "ESTIMATED_TIME_DISTANCE,"+
  "DIFFICULTY,"+
  "ADDITIONAL_TEXT,"+
  "FINISH_PLACE,"+
  "POINTS,"+
  "NUM_OF_TASKS," +
  "REAL_PRICE," +
  "IMG)";


var sqlCheckedCode : string = "CREATE TABLE IF NOT EXISTS CHECKED_CODE(" +
  "_ID INTEGER primary key NOT NULL UNIQUE, _DATE, TASK_ID INTEGER);";

var sqlHint  : string = "CREATE TABLE IF NOT EXISTS HINT(" +
  "_ID INTEGER primary key NOT NULL  UNIQUE, " +
  "TASK_ID INTEGER," +
  "HINT_TEXT," +
  "HINT_ORDER," +
  "USED INTEGER)";

var sqlGameOrder  : string = "CREATE TABLE IF NOT EXISTS GAME_ORDER(" +
  "GAME_ID INTEGER, " +
  "TASK_ID INTEGER," +
  "TASK_ORDER INTEGER," +
  "DONE INTEGER)";

var sqlGameImage  : string = "CREATE TABLE IF NOT EXISTS GAME_IMAGE(" +
  "_ID INTEGER, " +
  "FILE_NAME, " +
  "LOADED)";
export class DatabaseEngine{


  public db = new SQLite();
  constructor(){
    this.db.openDatabase({
      name: "MC.db",
      location: "default"
    });
  }
  public static size = (obj: any) => {
    let key;
    for (key in obj){
       if (obj.hasOwnProperty(key)){
         return obj[key].length;
       }
    }
    return 0;
  };

  public executeScript = (sql: string, params: string []) => {
    let main = this;
    return new Promise<string>(function(resolve, reject) {
      main.db.openDatabase({
        name: "MC.db",
        location: "default"
      }).then(() => {
        main.db.executeSql(sql, params).then((data) =>{
          resolve("SUCCESS");
        },
          (error) =>{
            reject(error);
          }
        )

      })
    })
  };

  public loadTable (tableName, jsonData) {
    let sql = "INSERT INTO " + tableName + " ";

    let fieldSql = "(";
    let paramSql = "(";
    let values = [];
    for (let i in jsonData) {
      let key = i;
      let val = jsonData[key];
      fieldSql = fieldSql + key + ",";
      paramSql = paramSql + "?,";
      values.push(val.toString());
      //alert(key+" = "+val);
    }
    fieldSql = fieldSql.substr(0, fieldSql.length - 1) + ")";
    paramSql = paramSql.substr(0, paramSql.length - 1) + ")";
    sql = sql + fieldSql + " VALUES " + paramSql;
    //paramsSql = "("
    return this.executeScript(sql, values);
  };

  public executeSelect = (sql: string, params: string []) => {
    let main = this;
    return new Promise<any>(function(resolve, reject) {
      main.db.openDatabase({
        name: "MC.db",
        location: "default"
      }).then(() => {
        main.db.executeSql(sql, params).then((data) =>{
            let result = [];
            for(let i = 0; i < data.rows.length; i++){
                result.push(data.rows.item(i));
            }
            resolve(result);
          },
          (error) =>{
            reject(error);
          }
        )

      })
    })
  };

  private dropCreateTable = (tableName: string, tableScript: string) =>  {
    //alert(tableScript);
    // return Promise.resolve();
    let main = this;
    return new Promise(function(resolve) {
      main.executeScript("DROP TABLE " + tableName, [])
        .then(function () {
          return main.executeScript(tableScript, []);
        })
        .catch(function(){
          return main.executeScript(tableScript, []);
        })
        .then(function () {
          return resolve("SUCCESS");
        });
    })

  }
  public clearTable(tableName : string){
    let main = this;
    return main.executeScript("DELETE FROM " + tableName, []);
  }

  public initDatabase = () =>  {
    //this.dropCreateTable("TASK", sqlTasks);
    let main = this;
    return new Promise(function (resolve) {
        main.dropCreateTable("TASK", sqlTasks)
        .then(function () {
          return main.dropCreateTable("CODE", sqlCodes)
        })
        .then(function () {
          return main.dropCreateTable("SIMILAR_CODE", sqlSimilarCode)
        })
        .then(function () {
          return main.dropCreateTable("GAME", sqlGame)
        })
        .then(function () {
          return main.dropCreateTable("HINT", sqlHint)
        })
        .then(function () {
          return main.dropCreateTable("GAME_ORDER", sqlGameOrder)
        })
        .then(function () {
          return main.dropCreateTable("CHECKED_CODE", sqlCheckedCode)
        })
        //.then(DatabaseEngine.dropCreateTable("GAME_INFO",sqlGameInfo))
        .then(function () {
          return main.dropCreateTable("GAME_IMAGE", sqlGameImage)
        })
        //.then(Loader.loadGameInfo())
        .then(function () {
          return resolve("SUCCESS")
        });
    });
  }
  public clearGame(gameId){
    let main = this;
    return new Promise(function (resolve) {
      let sqlCode = "DELETE FROM CODE WHERE TASK_ID IN (SELECT _ID FROM TASK WHERE GAME_ID = ?)";
      let sqlSimilarCode = "DELETE FROM SIMILAR_CODE WHERE TASK_ID IN (SELECT _ID FROM TASK WHERE GAME_ID = ?)";
      let sqlCheckedCode = "DELETE FROM CHECKED_CODE WHERE TASK_ID IN (SELECT _ID FROM TASK WHERE GAME_ID = ?)";
      let sqlHint = "DELETE FROM HINT WHERE TASK_ID IN (SELECT _ID FROM TASK WHERE GAME_ID = ?)";
      let sqlGameOrder = "DELETE FROM GAME_ORDER WHERE GAME_ID = ?";
      let sqlTask = "DELETE FROM TASK WHERE GAME_ID = ?";
      let sqlGame ="DELETE FROM GAME WHERE _ID = ?";
      main.executeScript(sqlCode, [gameId])
        .then(function () {
          return main.executeScript(sqlSimilarCode, [gameId])
        })
        .then(function(){
          return main.executeScript(sqlCheckedCode, [gameId])
        })
        .then(function () {
          return main.executeScript(sqlHint, [gameId])
        })
        .then(function () {
          return main.executeScript(sqlGameOrder, [gameId])
        })
        .then(function () {
          return main.executeScript(sqlTask, [gameId])
        })
        .then(function () {
          return main.executeScript(sqlGame, [gameId])
        })
        .then(function () {
          return resolve("SUCCESS")
        });
    })
  }
  public clearTables(){
    let main = this;
    return new Promise(function (resolve) {
      main.clearTable("TASK")
        .then(function () {
          return main.clearTable("CODE")
        })
        .then(function () {
          return main.clearTable("SIMILAR_CODE")
        })
        .then(function () {
          return main.clearTable("GAME")
        })
        .then(function () {
          return main.clearTable("HINT")
        })
        .then(function () {
          return main.clearTable("GAME_ORDER")
        })
        .then(function () {
          return main.clearTable("CHECKED_CODE")
        })
        //.then(DatabaseEngine.dropCreateTable("GAME_INFO",sqlGameInfo))
        //.then(Loader.loadGameInfo())
        .then(function () {
          return resolve("SUCCESS")
        });
    });
  }
}
