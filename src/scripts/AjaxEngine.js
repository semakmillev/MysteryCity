"use strict";
var AjaxEngine = (function () {
    function AjaxEngine(http) {
        this.http = http;
    }
    AjaxEngine.call = function (http, _method, _url, _data) {
        return new Promise(function (resolve, reject) {
            var url = _url + "?";
            if (_method == "GET") {
                for (var key in _data) {
                    if (_data.hasOwnProperty(key)) {
                        url = url + key + "=" + _data[key] + "&";
                    }
                }
            }
            http.get(url)
                .subscribe(function (res) {
                resolve(res.json());
            }, function (err) {
                alert(err);
                reject('Ошибка соединения');
            });
        });
    };
    return AjaxEngine;
}());
exports.AjaxEngine = AjaxEngine;
