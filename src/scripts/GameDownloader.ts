import {AjaxEngine} from "./AjaxEngine";
import {Http} from "@angular/http";
import {Consts} from "./Consts";
import {DatabaseEngine} from "./DatabaseEngine";
/**
 * Created by semak on 22.02.17.
 */

export class GameDownloader{
  private db = new DatabaseEngine();
  constructor(public gameId, public session, public http: Http){

  }
  downloadGame(){
    let main = this;
    return new Promise(function (resolve, reject) {
      AjaxEngine.call(main.http,
                      "GET",Consts.const_cgi + "getGame/"+main.gameId,
        {
          "session": main.session
        }
      )
        .then(function(res) {
          let result = (<any>res);
          main.db.loadTable("GAME",result[0]).then(function(){
            resolve("SUCCESS");
          });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };
//downloadGameFiles
  private downloadTable(functionName, tableName, errorText){
    let main = this;
    return new Promise(function (resolve, reject) {
      AjaxEngine.call(main.http,
        "GET",Consts.const_cgi +functionName+"/"+main.gameId,
        {}
      ).then(function (res) {
        // alert(o.length)
        //JSON.parse(o);
        //alert("downloaded gameTask");
        let result = (<any>res);
        let chain = Promise.resolve();
        let steps = 1;
        for (let i = 0; i < result.length; i = i + 1) {
          chain = chain.then(function() {
              main.db.loadTable(tableName, result[i]).then(function(){
                steps++;
                if(steps==result.length) {
                  resolve("SUCCESS");
                }
              })
            }
          );
        }
      }).catch(function (err) {
        console.log('Error:' + err);
        reject(errorText);
      });

    });
  }

  downloadTasks() {
    return this.downloadTable("getTasks", "TASK", "Ошибка загрузки заданий");
  };
  loadSimilarCodes() {
    return this.downloadTable("getSimilarCodes", "SIMILAR_CODE", "Ошибка загрузки кодов");
  };
  loadCodes(){
    return this.downloadTable("getCodes", "CODE", "Ошибка загрузки кодов");
  }
  loadHints(){
    return this.downloadTable("getHints", "HINT", "Ошибка загрузки подсказок");
  }
  loadTaskOrder(){
    return this.downloadTable("getGameOrder", "GAME_ORDER", "Ошибка загрузки порядка заданий");
  }
}
