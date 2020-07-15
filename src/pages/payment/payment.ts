import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { OrderconfirmationPage } from '../orderconfirmation/orderconfirmation';
import { GlobalProvider } from '../../providers/global/global';
import { MarketplacePage } from '../marketplace/marketplace';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {

  totalAmount: number = 0
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private storage: StorageProvider, 
    public alertCtrl: AlertController,
    private db: DatabaseProvider, 
    private globalP: GlobalProvider
    ) {
    
      this.totalAmount = navParams.get('amount')
  }

  ionViewDidLoad() {

  }



  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  paySecure() {
    this.storage.getData('signedToken').subscribe(uid=>{
      if(!uid) return this.navCtrl.push(LoginPage)
        this.storage.getData('cartItems').subscribe(cartItems=>{
          if(cartItems) {
            this.db.getClothingFromDataBase().subscribe(clothes=>{
              if(clothes) {

                let cartIds: Array<string> = []
                cartItems.map(cItems=>{
                  if(cItems && cItems.id) {
                    cartIds.push(cItems.id)
                  }
                })

                let cartInDb: Array<any> = [];
                clothes.map(cloth=>{
                  if(
                    cloth &&
                    cloth.id &&
                    cartIds.indexOf(cloth.id) >= 0
                  ) {
                    cartInDb.push(cloth)
                  }
                })

                let isBuyOK = true

                cartInDb.map(item=>{
                  if(
                    !item ||
                    typeof item.block === 'undefined' ||
                    typeof item.block.blocktime === 'undefined' ||
                    typeof item.block.user === 'undefined'
                  ) return

                  let currentDate = new Date()
                  let diffMs = currentDate.valueOf() - item.block.blocktime.valueOf()
                  let diffMin = parseFloat(((diffMs/1000)/60).toFixed(2));

                  if(diffMin > this.globalP.cartReservedTime || item.block.user !== uid) {
                    isBuyOK = false
                  }
                })

                if(!isBuyOK) {
                  return
                } else {
                  let reference = this.makeid(8)
                  let currentDate = new Date()

                  this.db.getUserFromDataBase(uid).subscribe(user=>{

                    let refs: Array<string> = []
                    if(user && user.refs) {
                        refs = user.refs
                    }
                    refs.push(reference)
                    this.db.setUsersRef(uid, refs)
                      .then(()=>{
                        cartItems.map(cartItem=>{
                          if(cartItem && cartItem.id) {
                            this.db.getDocIDFromDataBase(cartItem.id).subscribe(docId=>{
                              if(docId) {

                                this.db.updateClothStatus(docId[0], 'reserved').then(info=>{
                                })
                                //this.db.setBuyer(docId, reference, currentDate, uid, "").then(()=>{})
                              }
                            })
                          }
                        })
                      })
                      .then(()=>{
                        this.storage.removeData('cartItems').subscribe(()=>{
                          this.navCtrl.push(OrderconfirmationPage, {ref: reference})
                        })
                      })
                  })
                }

              }
            })
          }
        })
    })
  }

}
