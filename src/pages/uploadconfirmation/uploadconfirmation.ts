import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-uploadconfirmation',
  templateUrl: 'uploadconfirmation.html',
})
export class UploadconfirmationPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  back() {
    this.navCtrl.pop()
  }
}
