/**
 * Created by semak on 08.02.17.
 */
import {Http, Headers} from "@angular/http";


export class AjaxEngine{
  http : Http;
  constructor(http : Http){
    this.http = http;
  }
  public static call(http, _method, _url, _data){

    return new Promise(function(resolve, reject) {
      let url = _url + "?";
      if (_method == "GET") {
        for (let key in _data) {
          if (_data.hasOwnProperty(key)) {
            url = url + key + "=" + _data[key] + "&";
          }

        }

        http.get(url)
          .subscribe(res => {

            resolve(res.json());
          }, (err) => {
            alert(err);
            reject('Ошибка соединения');
          });
      }
      if(_method == "POST"){
        let headers = new Headers({ 'Content-type' : 'application/json'});
        try {
          http.post(_url, _data, {headers: headers})
            .subscribe(res => {
              resolve(res.json());
            }, (err) => {
              alert(err);
              reject('Ошибка соединения');
            });
        }catch(err){
          alert(err);
        }
      }
    });

  }
}
