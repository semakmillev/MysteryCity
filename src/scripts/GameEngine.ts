import {DatabaseEngine} from "./DatabaseEngine";
/**
 * Created by semak on 14.03.17.
 */
export class GameEngine {
  constructor() {

  }

  public static getRealCode(db: DatabaseEngine, taskId, codeValue) {
    return db.executeSelect("select * " +
                              "from SIMILAR_CODE " +
                              "where TASK_ID = ? and CODE = ?",[taskId, codeValue.toUpperCase()]);
  }
  public static getCode(db: DatabaseEngine, taskId, codeValue){
    let sqlCode =
      "SELECT * " +
      "  FROM CODE " +
      " WHERE TASK_ID = ?" +
      "   AND _VALUE = ?";

    return db.executeSelect(sqlCode, [taskId, codeValue.toUpperCase()]);
  }
  public static checkCodeDone(db: DatabaseEngine, taskId, codeId) {
    let main = this;
    return new Promise<number>(function (resolve) {
      let sql = "SELECT * FROM CHECKED_CODE WHERE _ID = ?";
      db.executeSelect(sql, [codeId])
        .then(function (result) {
          if (result.length > 0) {
            resolve(1);
          } else {
            resolve(0);
          }
        })
    });
  }
  public static setCodeDone(db: DatabaseEngine, taskId, codeId){
    let sql = "INSERT INTO CHECKED_CODE("+
              "_ID, _DATE, TASK_ID) VALUES (?, ?, ?)";
    return db.executeScript(sql, [codeId, new Date(), taskId]);
  }

  public static doCode(db: DatabaseEngine, taskId, codeValue) {
    let main = this;
    let code;
    return new Promise<string>(function (resolve, reject) {

      main.getCode(db, taskId, codeValue)
        .then(function (result) {
          code = result[0];
          return main.checkCodeDone(db, taskId, code["_ID"])
        })
        .then(function (res) {
          if (res == 1) {
            alert("done:" + res);
            reject(-1);
          } else {
            return main.setCodeDone(db, taskId, code["_ID"])
          }
        })
        .then(function () {
          resolve("SUCCESS");
        })
    })
  }
  public static checkCode(db: DatabaseEngine, taskId, codeValue){
    let main = this;
    return new Promise(function(resolve, reject){
      main.getRealCode(db,taskId,codeValue)
        .then(function (result) {
          if(result.length == 0){
            reject(0);
          }else{
            let realCodeValue = result[0]["REAL_CODE"];
            return main.doCode(db, taskId, realCodeValue);
          }
        })
        .then(function(){
          resolve("SUCCESS");
        })
        .catch(function(err){
          reject(err);
        });
    })

  }

  public static checkTaskDone(db: DatabaseEngine, taskId){
    return new Promise<number>(function(resolve){
      let sqlCheckedCodes = "SELECT COUNT(_ID) CODE2FIND FROM CHECKED_CODE WHERE TASK_ID = ?";
      let codeChecked : number;
      db.executeSelect(sqlCheckedCodes,[taskId])
        .then(function(res){
          codeChecked = res[0]["CODE2FIND"];
          let sqlCode2Find = "SELECT * FROM TASK WHERE _ID = ?";
          return db.executeSelect(sqlCode2Find,[taskId])

        })
        .then(function(res){
          let code2Find : number = res[0]["CODE2FIND"];
          if(codeChecked >= code2Find){
            resolve(1);
          }else{
            resolve(0);
          }
        })
    })
  }

  public static setTaskDone(db: DatabaseEngine, taskId){
    let sql = "UPDATE GAME_ORDER SET DONE = 1 WHERE TASK_ID = ?";
    return db.executeScript(sql,[taskId]);
  }

  public static resetGame(db: DatabaseEngine, gameId){
    return new Promise<string>(function(resolve){
      db.executeScript("UPDATE GAME_ORDER " +
                          "SET DONE = 0 " +
                        "WHERE TASK_ID in " +
                            "(SELECT _ID FROM TASK WHERE GAME_ID = ?)",[gameId])
        .then(function(){
          db.executeScript("UPDATE HINT " +
                              "SET USED = 0 " +
                            "WHERE TASK_ID in " +
                          "(SELECT _ID FROM TASK WHERE GAME_ID = ?)",[gameId])
        })
        .then(function(){
          db.executeScript("DELETE FROM CHECKED_CODE " +
                            "WHERE TASK_ID in " +
                          "(SELECT _ID FROM TASK WHERE GAME_ID = ?)",[gameId])

        })
        .then(function(){
          resolve("SUCCESS");
        });
    })
  }

}
