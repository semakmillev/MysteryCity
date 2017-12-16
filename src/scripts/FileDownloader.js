"use strict";
var ionic_native_1 = require('ionic-native');
var FileDownloader = (function () {
    function FileDownloader() {
    }
    FileDownloader.checkFile = function (directory, fileName) {
        return new Promise(function (resolve) {
            ionic_native_1.File.checkFile(directory, fileName)
                .then(function () {
                resolve(1);
            })
                .catch(function () {
                resolve(0);
            });
        });
    };
    FileDownloader.checkFileExistance = function (fileName) {
        /*reader.onloadend = function(event){
          if(event.target == null){
            alert('No!');
          }else {
            alert('Yes!');
          }
        }*/
        //  cordova.file.dataDirectory+fileName);
        //reader.
        /*cordova.file.checkFile(cordova.file.dataDirectory, fileName)
          .then(function (success) {
            alert('yes');
          })
          .then(function(error){
            alert(error);
          });*/
    };
    FileDownloader.download = function (fileSource, fileOutput) {
    };
    return FileDownloader;
}());
exports.FileDownloader = FileDownloader;
