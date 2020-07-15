import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";

/**
 * Generated class for the MeetusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-meetus',
  templateUrl: 'meetus.html',
})
export class MeetusPage {

  isMeetUsPage: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewWillEnter() {
    if (this.navParams.get("meetus")){
      this.isMeetUsPage = true;
    }
  }

  goBack(){
    this.navCtrl.setRoot(HomePage);
  }

}
