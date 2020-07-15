import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { HomePage } from '../home/home';
import { DatabaseProvider } from '../../providers/database/database';

/**
 * Generated class for the TutorialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})
export class TutorialPage {

  isUser: boolean
  userId: any
  showTutorial: boolean = false

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: StorageProvider,
    public toastController: ToastController,
    public db: DatabaseProvider) {

  }

  ionViewWillEnter() {
    if(this.navParams.get("startFrom") === "homepage") return this.showTutorial = true
    /*
    * too slow the load if we check the database
    *
    this.storage.getData("signedToken").subscribe(userID => {
      if(userID) {
        this.isUser = true
        this.userId = userID
        this.db.getUserFromDataBase(userID).subscribe(user => {
          if(user.tutorialHasSeen === "yes") this.navCtrl.setRoot(HomePage)
        })
      } else {
        this.isUser = false
        this.storage.getData("tutorialHasSeen").subscribe(ths => {
          if(ths === "yes") this.navCtrl.setRoot(HomePage)
        })
      }
    }) */
    this.storage.getData("tutorialHasSeen").subscribe(ths => {
      if(ths === "yes") {
        this.navCtrl.setRoot(HomePage)
        this.showTutorial = false;
      } else {
        this.showTutorial = true;
      }
    })
  }

  skipTutorial() {
    if(this.navParams.get("startFrom") === "homepage") return this.navCtrl.setRoot(HomePage)
    this.storage.setData("tutorialHasSeen", "yes").subscribe(() => {
      this.navCtrl.setRoot(HomePage)
    })
    /*
    if(this.isUser) {
      console.log("van user")
      this.db.updateTutorialHasSeen(this.userId, "yes").then(() => {
        this.navCtrl.setRoot(HomePage)
      })
    } else {
      console.log("nincs user")
      this.storage.setData("tutorialHasSeen", "yes").subscribe(() => {
        this.navCtrl.setRoot(HomePage)
      })
    }
    */
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TutorialPage');
  }

}
