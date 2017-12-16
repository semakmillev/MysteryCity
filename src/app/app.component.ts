import {Component, ViewChild, ViewContainerRef, ComponentFactory, ComponentFactoryResolver} from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { LogoPage} from '../pages/logoPage/logoPage';
import { Page2 } from '../pages/page2/page2';
import {LoginPage} from "../pages/login/login";
import { SqlExplorerPage } from "../pages/sql-explorer/sql-explorer";
import {GameListPage} from "../pages/game-list/game-list";
import {UserInfoPage} from "../pages/user-info/user-info";
import {PlayerInfoPage} from "../pages/player-info/player-info";




@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LogoPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Sql Explorer', component: SqlExplorerPage},
      { title: 'Список игр', component: GameListPage},
      { title: 'Игрок', component: PlayerInfoPage}
      ];


  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
