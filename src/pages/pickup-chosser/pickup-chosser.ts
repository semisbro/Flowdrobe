import { Component } from '@angular/core';
import { IonicPage, Button, NavController, NavParams, AlertController } from 'ionic-angular';
import { MarketplacePage } from '../marketplace/marketplace';
import { UploadpicturePage } from '../uploadpicture/uploadpicture';
import { DatabaseProvider } from "../../providers/database/database";
import { StorageProvider } from "../../providers/storage/storage";
import { Token } from "@angular/compiler";
import { LoginPage } from "../login/login";

/**
 * Generated class for the PickupChosserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pickup-chosser',
  templateUrl: 'pickup-chosser.html',
})
export class PickupChosserPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private db: DatabaseProvider,
    private storage: StorageProvider,
    private alert: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickupChosserPage');
  }

  requestPickup() {
    this.storage.getData("signedToken").subscribe(token => {
      if (!Token) this.navCtrl.push(LoginPage)

      this.alert.create({
        //title: "Request pickup",
        subTitle: "Be notified how to give your leftovers new life :)",
        buttons: [{
          cssClass: 'alert-secondary',
          text: "Cancel",
          handler: () => {
            return;
          }
        },
        {
          cssClass: 'alert-primary',
          text: "OK",
          handler: () => {

            this.db.getUserFromDataBase(token).subscribe(user => {
              const requestPickup = {
                dateOfRequest: new Date().toLocaleDateString(),
                userUid: token,
                userName: user.name,
                userStreet: user.street,
                userCity: user.city,
                userPostalCode: user.postalCode,
                userPhone: user.phone
              }
              this.db.setNewRequestPickupItem(requestPickup).subscribe(res => {
                this.alert.create({
                  subTitle: "We will notify you!",
                  buttons: [{
                    text: "Thanks",
                    handler: () => {
                      this.navCtrl.push(MarketplacePage)
                    }
                  }]
                }

                ).present()
              })
            })

          }
        }]

      }).present()

    })
  }

  goToMarketplace() {
    this.navCtrl.pop();
  }

  goToSellSelf() {
    this.storage.getData("signedToken").subscribe(token => {
      if (!token) return this.navCtrl.push(LoginPage)
      this.db.getUserFromDataBase(token).subscribe(user => {
        this.navCtrl.push(UploadpicturePage)
      })

    })
  }
}