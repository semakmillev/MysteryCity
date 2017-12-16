import {Http} from "@angular/http";
import {AjaxEngine} from "./AjaxEngine";
import {Consts} from "./Consts";
import {window} from "rxjs/operator/window";
import {InAppBrowser} from "ionic-native";

export class YandexPayment {
  constructor(private http: Http,
              private session: string,
              private gameId: number,
              private price: number) {
  }

  public registerPayment() {

    let main = this;
    return AjaxEngine.call(main.http, "GET", Consts.const_cgi + "Payment.py",
      {
        functionName: 'setPurchase',
        session: main.session,
        gameId: main.gameId,
        price: main.price
      }
    );
  }

  public makePayment() {
    let main = this;

    return new Promise(function (resolve, reject) {
      let html = 'http://195.42.183.91/cgi-bin/KenigQuest/Payment.py?functionName=setPurchase' +
        '&session=' + main.session+
        '&gameId=' + main.gameId +
        '&price=' + main.price;
      let browser = new InAppBrowser(html, '_blank', 'location=no');
      browser.on("loadstart").subscribe(
        (event) => {
          let url = event.url.toString();
          if (url.indexOf("my-application") > 0 || url.indexOf("://www.ya.ru") > 0) {
            browser.close();
            resolve();
          }
        }
      );
    });
  }
}

