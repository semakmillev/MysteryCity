import {
  Component, ViewContainerRef, ViewChild, ComponentFactory, ComponentFactoryResolver,
  ElementRef, Sanitizer, SecurityContext
} from '@angular/core';
import {File, Transfer} from 'ionic-native';
import {NavController, Platform, Content} from 'ionic-angular';
import {Splashscreen} from 'ionic-native';
import {DatabaseEngine} from "../../scripts/DatabaseEngine";
import {LoginPage} from "../login/login";
import {AjaxEngine} from "../../scripts/AjaxEngine";
import {Http} from "@angular/http";
import {Consts} from "../../scripts/Consts.ts"
import {FileDownloader} from "../../scripts/FileDownloader";
import {GameListPage} from "../game-list/game-list";
//import {ChildComponent} from "../../components/child/child";
declare var cordova:any;
declare var ionic: any;

@Component({
  selector: 'page-logoPage',
  templateUrl: 'logoPage.html'
})

export class LogoPage {
  //@ViewChild('parent', {read: ViewContainerRef}) tst: ViewContainerRef;
  constructor(public navCtrl: NavController,
              public http: Http,
              public platform : Platform) {
    if( 0!=0 ) {
      navCtrl.push(LoginPage);
      return;
    }


  }

  ionViewDidLoad() {
    let main = this;
    this.platform.ready()
      .then(function () {
        return main.downloadImages(main.http);
      })
      .then(function () {
        let initDB = localStorage.getItem("DB");
        if (initDB != "MC1.0") {
          let db = new DatabaseEngine();
          db.initDatabase()
            .then(function () {
              localStorage.setItem("DB", "MC1.0");
              let session = localStorage.getItem("SID");
              Splashscreen.hide();
              if (session != null && session != "" && session != undefined) {
                main.navCtrl.setRoot(GameListPage);
              }else {
                main.navCtrl.setRoot(LoginPage);
              }
            });
        } else {
          let session = localStorage.getItem("SID");
          Splashscreen.hide();
          if (session != null && session != "" && session != undefined) {
            main.navCtrl.setRoot(GameListPage);
          }else {
            main.navCtrl.setRoot(LoginPage);
          }
        }

      });
  }

  private checkFile(directory, fileName){
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
  public downloadImages(http: Http) {
    let main = this;
    return new Promise(function (resolve) {
      AjaxEngine.call(http, "GET", Consts.const_cgi + "getGameImages",{})
        .then(function (res) {
          //alert(res[0]["FILE_NAME"]);
          let result = (<any> res);

          for (let i = 0; i < result.length; i = i + 1) {

            let outputPath = "";
            let extDirectory = "";
            try {
              extDirectory = cordova.file.externalDataDirectory;
            } catch (err) {
              console.log(err);
            }
            let chain = Promise.resolve();
            var step = 0;
            chain = chain.then(function () {
              return main.checkFile(extDirectory, result[i]["FILE_NAME"])
                .then(function (fileExists) {
                  step = step + 1;
                  if(fileExists == 1) {
                    return Promise.resolve();
                  }else {
                    let fileTransfer = new Transfer();
                    let fileName = result[step - 1]["FILE_NAME"];
                    let fileFrom = Consts.uploadFolder + fileName;
                    return fileTransfer.download(fileFrom, extDirectory + fileName);
                  }
                    //fileTransfer()

                })
                .then(function () {
                  if (step == result.length) {
                    resolve("SUCCESS");
                  }
                })
                .catch(function(err){
                  console.log(err.message);
                  resolve("ERR");
                  //fileTransfer()
                });
            });

          }
        });
    });
  }

}

/*
 var step = 0;
 for (var i = 0; i < o.length; i = i + 1) {
 try {

 // var outputPath = "/storage/emulated/0/Download/helloworld.pdf";
 var outputPath = "";
 var extDirectory = "";
 try {
 extDirectory = cordova.file.externalDataDirectory;
 }catch (err){
 console.log(err);
 }
 var chain = Promise.resolve();
 var step = 0;

 chain = chain.then(
 Loader.checkImageExists(o[i]["FILE_NAME"])
 .then(function (res) {
 step++;
 //alert(step);
 if (res == 1 || extDirectory == "") {
 //resolve("SUCCESS")
 return Promise.resolve();
 } else {
 //alert(o[step-1]["FILE_NAME"]);

 outputPath = extDirectory + o[step-1]["FILE_NAME"];
 var fileName = uploadFolder + o[step-1]["FILE_NAME"];
 var inputUri = encodeURI(fileName);
 return GameDownloader.downloadFile(encodeURI(inputUri), outputPath)
 .then(function () {
 return Loader.loadTable("GAME_IMAGE", o[step - 1])
 })
 }
 }).then(function () {

 if (step == o.length) {
 resolve("SUCCESS");
 }
 })
 );
 } catch (err) {
 console.log("Img error:" + err);
 resolve("SUCCESS");
 }
 }

 */
