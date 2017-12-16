import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { LogoPage} from '../pages/logoPage/logoPage';
import { Page2 } from '../pages/page2/page2';
import { LoginPage } from '../pages/login/login';
import { SqlExplorerPage } from "../pages/sql-explorer/sql-explorer";
import {GameListPage} from "../pages/game-list/game-list";
import {GamePage} from "../pages/game/game";
import {Ionic2RatingModule} from "ionic2-rating";
import {UserInfoPage} from "../pages/user-info/user-info";
import {PlayerInfoPage} from "../pages/player-info/player-info";


@NgModule({
  declarations: [
    MyApp,
    LogoPage,
    LoginPage,
    SqlExplorerPage,
    GameListPage,
    GamePage,
    PlayerInfoPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    Ionic2RatingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LogoPage,
    LoginPage,
    SqlExplorerPage,
    GameListPage,
    GamePage,
    PlayerInfoPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
