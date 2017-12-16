import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {DatabaseEngine} from "../../scripts/DatabaseEngine";


/*
  Generated class for the SqlExplorer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sql-explorer',
  templateUrl: 'sql-explorer.html'
})
export class SqlExplorerPage {
  scriptText: any;
  headerGrid: Array<Array<string>> = Array();
  resultGrid: Array<Array<string>> = Array();

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SqlExplorerPage');
  }

  public executeSql() {
    let main = this;
    let db = new DatabaseEngine();
    db.executeSelect(main.scriptText, [])
      .then(function (res) {
        let result = (<any>res);
        if (result.length > 0) {
          let headers = Object.keys(result[0]);
          main.headerGrid.push(headers);

          for (let i = 0; i < result.length; i++) {
            let row = [];
            for (let j = 0; j < headers.length; j++) {
              row.push(result[i][headers[j]]);
            }
            main.resultGrid.push(row);
          }
        }
      });
  }
}
