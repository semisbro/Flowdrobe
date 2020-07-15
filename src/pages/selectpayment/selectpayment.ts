
import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import * as MobilePaySDK from "cordova-mobilepay-appswitch";
import {MobilePayMessagesProvider} from "../../providers/mobilepay/mobilepay";
import {HomePage} from "../home/home";
import {StorageProvider} from "../../providers/storage/storage";
import {DatabaseProvider} from "../../providers/database/database";
import {LoginPage} from "../login/login";
import {OrderconfirmationPage} from "../orderconfirmation/orderconfirmation";
import {GlobalProvider} from "../../providers/global/global";
import {MarketplacePage} from "../marketplace/marketplace";

const uuid = require('uuid');
@IonicPage()
@Component({
  selector: "page-selectpayment",
  templateUrl: "selectpayment.html"
})
export class SelectpaymentPage {


  transaction = {
    buyerId: "",
    sellerId: "",
    paymentTotal: 0.0,
    timeStamp: new Date(),
    articleId:"",
    errorMsg: "",
    orderNo: "",
    mobilePayTransactionId: "",
    mobilePaySignature: ""
  }

  itemsTotalValue: number = 0
  title: string = ""
  paymentTotalFinite: number = 0

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public alert: AlertController,
              private mpMsg: MobilePayMessagesProvider,
              private storage: StorageProvider,
              private db: DatabaseProvider,
              private globalP: GlobalProvider
  ) {
    this.itemsTotalValue = navParams.get('total')
    this.title = this.navParams.get("title")
    this.transaction.paymentTotal = this.itemsTotalValue + 27.5;
  }

  ionViewWillEnter() {
    this.storage.getData('signedToken').subscribe(userID => {
      if (userID) {
        this.transaction.buyerId = userID;
      }
    })

    this.transaction.sellerId = this.navParams.get("sellerId")
    this.transaction.articleId = this.navParams.get("articleId")
  }

  openPaymentPage() {
    MobilePaySDK.isMobilePayInstalled((error: Error, isInstalled: boolean) => {
      if(!isInstalled)
      {
        this.alert.create({
          title: this.mpMsg.ERROR_HDR,
          subTitle: this.mpMsg.NOT_FOUND_SUB,
          message: this.mpMsg.NOT_FOUND_MSG,
          buttons: ['OK']
        }).present();

        return
      }

      const options = {returnSeconds: 9, timeoutSeconds: 20};

      MobilePaySDK.setupWithMerchantId(this.mpMsg.MERCHANT_ID, this.mpMsg.URL_SCHEME, options,  (error: Error) => {

        if(error){
          this.mobilePayErrorHandling(1)
          return
        }

        var order_id = uuid();
        this.transaction.orderNo = order_id;
        var price = parseFloat(String(this.transaction.paymentTotal).replace(",", "."))
        if (!isNaN(price)){
        MobilePaySDK.beginMobilePaymentWithPayment(order_id, price , (error: Error, payment) =>{
          if (error){
            this.mobilePayErrorHandling(error['errorCode']);
            this.transaction.errorMsg = JSON.stringify(error);

            // TO_DO Save error in DB
          }

          if (!payment['success']) {
            return
          }

          this.transaction.mobilePaySignature = payment['signature']
          this.transaction.mobilePayTransactionId = payment['transactionId']

          this.db.setNewTransactionItem(this.transaction).subscribe(res => {

            this.alert.create({
              title: this.mpMsg.PUR_COMP_HDR,
              message: this.mpMsg.PUR_COMP_MSG,
              buttons: ['OK']
            }).present();



            this.buyProduct(this.transaction.articleId).then(res =>{

                this.navCtrl.setRoot(HomePage);


            })

          })
          //Purchase complete


          //TO-DO Save transaction result in DB

          /*console.log("PAYMENT VARIABLES --> ",
              ' Orderid = ' +  payment['orderId'],
              ' -|- Success = ' + payment['success'],
              ' -|- Cancelled = ' + payment['cancelled'],
              ' -|- TransactionId = ' + payment['transactionId'],
              ' -|- Signature = ' + payment['signature'],
              ' -|- Product price = ' + payment['productPrice'],
              ' -|- Amount Withdrawn from card = ' + payment['amountWithdrawnFromCard']);*/
        })
        }else{

        }
      })
    })
  }

  buyProduct(articleId){
    console.log("console log 1")
    return new Promise((resolve, reject) =>{
      this.storage.getData('signedToken').subscribe(uid=>{
        if(!uid) return this.navCtrl.push(LoginPage)
        console.log("console log 2")
          console.log("console log 3")
          this.db.getSpecificClothFromDataBase(articleId).subscribe(clothes=>{
            if(clothes) {
              console.log("console log 4")
              let isBuyOK = true
              if(!isBuyOK) {
                this.showAlert();
              } else {
                let reference = uuid()
                let currentDate = new Date()
                console.log("console log 7")
                this.db.getUserFromDataBase(uid).subscribe(user=>{
                  console.log("console log 8")
                    clothes.map(item =>{
                      if(item && item.id){
                      this.db.getDocIDFromDataBase(item.id).subscribe(docId=>{
                        if(docId) {
                          console.log("console log 9")
                          this.db.updateClothStatus(docId[0], 'bought').then(info=> {
                            console.log("console log 7")
                            this.storage.removeData('cartItems').subscribe(() => {
                              return resolve(true)
                            })
                          })

                        }
                      })
                      }
                    })
                })
              }

            }
          })
      })
    })
  }

  showAlert() {
    const alert = this.alert.create({
      subTitle: 'You ran out of time. Please go back to the cart and start the process again, as your products may have been sold out in the meantime.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.navCtrl.setRoot(MarketplacePage, {tab: 'cart', rootHome: true})
        }
      }]
    });
    alert.present();
  }

  mobilePayErrorHandling(errorCode: number) {
    switch (errorCode) {
      case 1:
      case 2:
      case 4:
      case 5:
      case 9:
      case 10:
      case 11:
      case 12:
        // Technical error
        this.alert
          .create({
            title: this.mpMsg.ERROR_HDR,
            subTitle: this.mpMsg.TECH_ERR_SUB,
            message: this.mpMsg.TECH_ERR_MSG + errorCode,
            buttons: ["OK"]
          })
          .present();
        break;
      case 3:
        // Mobilepay app out of date
        this.alert
          .create({
            title: this.mpMsg.ERROR_HDR,
            subTitle: this.mpMsg.MP_OOD_SUB,
            message: this.mpMsg.MP_OOD_MSG,
            buttons: ["OK"]
          })
          .present();
        break;
      case 6:
        // Transaction timeout
        this.alert
          .create({
            title: this.mpMsg.ERROR_HDR,
            subTitle: this.mpMsg.TRANS_TOUT_SUB,
            message: this.mpMsg.TRANS_TOUT_MSG,
            buttons: ["OK"]
          })
          .present();
        break;
      case 7:
        // Amount limit exceeded
        this.alert
          .create({
            title: this.mpMsg.ERROR_HDR,
            subTitle: this.mpMsg.AML_EXC_SUB,
            message: this.mpMsg.AML_EXC_MSG,
            buttons: ["OK"]
          })
          .present();
      case 8:
        // Reservation period exceeded
        this.alert
          .create({
            title: this.mpMsg.ERROR_HDR,
            subTitle: this.mpMsg.RES_PER_EXC_SUB,
            message: this.mpMsg.RES_PER_EXC_MSG,
            buttons: ["OK"]
          })
          .present();
    }
  }
}
