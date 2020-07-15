import { Component, ViewChild } from "@angular/core"
import { Platform, Nav, Events, AlertController } from "ionic-angular"
import { StatusBar } from "@ionic-native/status-bar"
import { SplashScreen } from "@ionic-native/splash-screen"


import { HomePage } from "../pages/home/home"
import { TutorialPage } from "../pages/tutorial/tutorial"
import { ErrorPage } from "../pages/error/error"
import { Network } from "@ionic-native/network"
import { StorageProvider } from "../providers/storage/storage"
import { AdminhistoryPage } from "../pages/adminhistory/adminhistory"
import { LoginPage } from "../pages/login/login"
import { AuthProvider } from "../providers/auth/auth"
import { DatabaseProvider } from "../providers/database/database"

import { SignupPage } from "../pages/signup/signup"
import { MeetusPage } from "../pages/meetus/meetus"

const uuid = require("uuid")

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any = TutorialPage
  @ViewChild(Nav) nav: Nav
  loginState: boolean = false
  isAdmin: boolean = false
  username: string = ""

  constructor(
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public network: Network,
    private storage: StorageProvider,
    public authProvider: AuthProvider,
    public events: Events,
    private db: DatabaseProvider
  ) {
    events.subscribe("user:created", user => {
      switch (user) {
        case "user":
          console.log("user created", user)
          this.loginState = true
          this.isAdmin = false
          this.setUserName()
          break
        case "admin":
          this.loginState = true
          this.isAdmin = true
          break
        default:
          this.loginState = false
          this.isAdmin = false
          break
      }
    })

    platform
      .ready()
      .then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.

        statusBar.styleDefault()
        splashScreen.hide()
      })
      .catch(error => {
        console.log("ERROR", error)
      })

    this.network.onDisconnect().subscribe(() => {
      this.nav.push(ErrorPage, { errorCode: 1 })
    })

    this.setUserName();
  }

  setUserName(){
    this.storage.getData("signedToken").subscribe(userID => {
      if (!userID) {
        console.log("signedToken:", userID)
        this.loginState = false
        console.log(this.loginState)
      } else {
        this.loginState = true
        console.log(this.loginState)
        this.db.getUserFromDataBase(userID).subscribe(userInfo => {
          if (userInfo && userInfo.name) {
            this.username = userInfo.name
          }
        })
      }
    })
  }

  openPage(page) {
    switch (page) {
      case "LoginPage":
        this.nav.push(LoginPage)
        break
      // case "ReservationhistoryPage":
      //   this.nav.push(ReservationhistoryPage)
      //   break
      case "AdminhistoryPage":
        this.nav.push(AdminhistoryPage)
        break
      case "EditProfile":
        this.nav.push(SignupPage, { isEdit: true })
        break
      case "TermsOfTradePage":
        this.nav.push(MeetusPage, { meetus: false })
        break
      case "TutorialPage":
        this.nav.push(TutorialPage, { startFrom: "homepage"})
        break
      default:
        break
    }
  }

  deleteStorage() {
    this.storage.removeData("swipedCards").subscribe(info => {
      this.storage.removeData("filters").subscribe(info => {
        this.storage.removeData("newFilters").subscribe(info => {
          this.storage.removeData("cartItems").subscribe(info => {
            this.storage.removeData("itemDetails").subscribe(info => {
              location.reload()
            })
          })
        })
      })
    })
  }

  resetSwipedCards(){
    this.storage.getData("swipedCards").subscribe(cards => {
      const remainingItems = cards.filter( card => {
        return card.intention === 1;
      })
      this.storage.setData("swipedCards", remainingItems).subscribe(res =>{
        location.reload();
      })
    })
  }

  signout() {
    this.authProvider.logoutUser().then(() => {
      this.nav.push(HomePage)
    })
  }
}
