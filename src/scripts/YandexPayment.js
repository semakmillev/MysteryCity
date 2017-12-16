"use strict";
var AjaxEngine_1 = require("./AjaxEngine");
var Consts_1 = require("./Consts");
var ionic_native_1 = require("ionic-native");
var YandexPayment = (function () {
    function YandexPayment(http, session, gameId, price) {
        this.http = http;
        this.session = session;
        this.gameId = gameId;
        this.price = price;
    }
    YandexPayment.prototype.registerPayment = function () {
        var main = this;
        return AjaxEngine_1.AjaxEngine.call(main.http, "GET", Consts_1.Consts.const_cgi + "Payment.py", {
            functionName: 'setPurchase',
            session: main.session,
            gameId: main.gameId,
            price: main.price
        });
    };
    YandexPayment.prototype.makePayment = function () {
        return new Promise(function (resolve, reject) {
            var html = 'http://195.42.183.91/cgi-bin/KenigQuest/Payment.py?functionName=setPurchase' +
                '&session=' + this.session +
                '&gameId=' + this.gameId +
                '&price=' + this.price;
            var browser = new ionic_native_1.InAppBrowser(html, '_blank', 'location=no');
            var main = this;
            browser.on("loadstart").subscribe(function (event) {
                var url = event.url.toString();
                if (url.indexOf("my-application") > 0 || url.indexOf("ya.ru")) {
                    browser.close();
                    resolve();
                }
            });
        });
    };
    return YandexPayment;
}());
exports.YandexPayment = YandexPayment;
