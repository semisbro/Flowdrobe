import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  ViewController
} from 'ionic-angular';

/**
 * Generated class for the ImageViewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-image-viewer',
  templateUrl: 'image-viewer.html'
})
export class ImageViewerPage {
  img;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCrtl: ViewController
  ) {
    this.img = this.navParams.get('image');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageViewerPage');
  }
  dismiss() {
    this.viewCrtl.dismiss();
  }
}
