import {File, Transfer} from 'ionic-native'
declare var cordova: any;
declare var $cordovaFile:any;
export class FileDownloader{
  constructor(){

  }
  public static checkFile(directory, fileName){
    return new Promise(function(resolve){
      File.checkFile(directory, fileName)
        .then(function () {
          resolve(1);
        })
        .catch(function() {
          resolve(0);
        });
    });
  }

  public static checkFileExistance(fileName){
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

  }
  public static download(fileSource: string, fileOutput: string) {
  }


}
