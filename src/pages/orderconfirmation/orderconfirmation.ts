import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ReservationhistoryPage } from '../reservationhistory/reservationhistory';

@IonicPage()
@Component({
  selector: 'page-orderconfirmation',
  templateUrl: 'orderconfirmation.html',
})
export class OrderconfirmationPage {

  reference: string = ''
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.reference = navParams.get('ref')
  }

  ionViewDidLoad() {
  }

  openHomePage() {
    this.navCtrl.setRoot(HomePage);
  }

  openReservationPage() {
    this.navCtrl.setRoot(ReservationhistoryPage)
  }
  

}
