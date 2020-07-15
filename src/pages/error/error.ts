import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Network } from '@ionic-native/network';

/**
 * Generated class for the ErrorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-error',
  templateUrl: 'error.html',
})
export class ErrorPage {

  errorCode: number;
  errorType: string;
  errorMsg: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public network: Network) {
    this.errorCode = this.navParams.get('errorCode');
    
    switch (this.errorCode) {
      case 0:
        this.errorType = "Is there internet connection?";
        this.errorMsg = "Please try to connect again, then the application will restart automatically"
        break;
      case 1:
        this.errorType = "Your internet connection is failed";
        this.errorMsg = "Please try to connect again"
        break;
      default:
        break;
    }

    this.network.onConnect().subscribe(() => {
        window.location.reload();
    });
    
  }
}
