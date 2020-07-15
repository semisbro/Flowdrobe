// import { Component } from '@angular/core';
// import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
// import * as firebase from 'firebase/app';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { DatabaseProvider } from '../../providers/database/database';
// import { HomePage } from '../home/home';
// import { StorageProvider } from '../../providers/storage/storage';
// import { UploadpicturePage } from '../uploadpicture/uploadpicture';
// import { GlobalProvider } from '../../providers/global/global';
// import { ProductPage } from '../product/product';
// import {SelectpaymentPage} from "../selectpayment/selectpayment";
//
// @IonicPage()
// @Component({
//   selector: 'page-adminhome',
//   templateUrl: 'adminhome.html',
// })
// export class AdminhomePage {
//
//   adminpage: string = "wardrobe";
//
//   availableClothes: Array<any> = [];
//
//   offerClothesBuyer: Array<any> = [];
//   offerClothesSeller: Array<any> = [];
//
//   offerAcceptedClothesBuyer:Array<any> = [];
//   offerAcceptedClothesSeller:Array<any> = [];
//
//   searchedClothes: Array<any> = [];
//
//   userId: string = '';
//   userName: string = '';
//   userCity: string = '';
//
//   constructor(
//     public navCtrl: NavController,
//     public navParams: NavParams,
//     public alertCtrl: AlertController,
//     private afAuth: AngularFireAuth,
//     private db: DatabaseProvider,
//     private storage: StorageProvider,
//     private globalP: GlobalProvider
//   ) {
//
//   }
//
//   ionViewWillEnter() {
//
//     this.storage.getData('signedToken').subscribe(userID => {
//       if (!userID) {
//         return;
//       } else {
//         this.db.getUserFromDataBase(userID).subscribe(user => {
//             if (!user) {
//               return;
//             } else {
//                 this.userId = userID
//                 console.log("user info:", user["name"], user["city"])
//                 this.loadAvailableClothes()
//             }
//         })
//       }
//     })
//   }
//
//   loadAvailableClothes() {
//     console.log("loading clothes!!!")
//     // Available
//     this.db.getAdminClothesFromDataBase(this.userId, 'available').subscribe(avClothes => {
//
//       this.availableClothes = avClothes;
//
//       this.availableClothes.map(item=>{
//         if(item && item.img && item.img[0]) {
//           firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
//             item.cardImg = 'url(' + url + ')';
//           });
//         }
//       });
//     });
//     /*this.availableClothes["uploadDate "].sort(function(a, b){
//         if(a.name < b.name) { return -1; }
//         if(a.name > b.name) { return 1; }
//         return 0;
//       })*/
//
//     //offerSeller clothes
//     this.db.getAdminClothesFromDataBase(this.userId, 'offer').subscribe(offerClothes => {
//
//       this.offerClothesSeller = offerClothes;
//
//       this.offerClothesSeller.map(item => {
//         if (item && item.img && item.img[0]) {
//           firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
//             item.cardImg = 'url(' + url + ')';
//           });
//         }
//       });
//     });
//
//     //offerClothes buyer
//     this.db.getBoughtClothesFromDataBase(this.userId, 'offer').subscribe(offerClothes => {
//
//       this.offerClothesBuyer = offerClothes;
//
//       this.offerClothesBuyer.map(item => {
//         if (item && item.img && item.img[0]) {
//           firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
//             item.cardImg = 'url(' + url + ')';
//           });
//         }
//       });
//     })
//
//     //offer accepted buyer
//     this.db.getBoughtClothesFromDataBase(this.userId, 'accepted').subscribe(accepted => {
//       this.offerAcceptedClothesBuyer = accepted;
//
//       this.offerAcceptedClothesBuyer.map(item => {
//         if (item && item.img && item.img[0]) {
//           firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
//             item.cardImg = 'url(' + url + ')';
//           });
//         }
//       });
//       console.log("bought clothes", accepted)
//     })
//
//     //offer accepted seller
//     this.db.getAdminClothesFromDataBase(this.userId, 'accepted').subscribe(accepted => {
//       this.offerAcceptedClothesSeller = accepted;
//
//       this.offerAcceptedClothesSeller.map(item => {
//         if (item && item.img && item.img[0]) {
//           firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
//             item.cardImg = 'url(' + url + ')';
//           });
//         }
//       });
//     })
//   }
//
//   searchInItems(event) {
//     this.searchedClothes = [];
//     this.adminpage = 'searched';
//     let searchTerm = event.target.value;
//     if (searchTerm && searchTerm.length > 0) {
//       this.db.getClothingFromDataBase().subscribe(clothes => {
//         if (clothes) {
//           clothes.map(item => {
//             if (item && item.ref) {
//               if (item.ref.indexOf(searchTerm) >= 0) {
//
//                 if (item.img && item.img[0]) {
//                   firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
//                     item.cardImg = 'url(' + url + ')';
//                     this.searchedClothes.push(item);
//                   });
//                 }
//
//               }
//             }
//           });
//         }
//       });
//     }
//   }
//
//   deleteItem(item) {
//     const confirm = this.alertCtrl.create({
//       title: 'Are you sure you want to delete this item?',
//       message: "This item will be deleted immediately from the wardrobe. Users can no longer buy it.",
//       buttons: [
//         {
//           text: 'Cancel',
//           handler: () => {
//
//           }
//         },
//         {
//           text: 'Delete',
//           handler: () => {
//             this.db.getDocIDFromDataBase(item).subscribe(res => {
//               this.db.updateClothStatus(res, "deleted").then(res=>{
//                 this.loadAvailableClothes();
//               })
//             })
//           }
//         }
//       ]
//     });
//     confirm.present();
//   }
//
//   editItem(cItem){
//     this.db.getSpecificClothFromDataBase(cItem).subscribe(res =>{
//         this.navCtrl.push(UploadpicturePage, {cItem: res})
//       })
//   }
//
//   confirmRequest(item: any) {
//     const confirm = this.alertCtrl.create({
//       title: 'Are you sure you want to confirm this request?',
//       message: "Have you made sure that this product is available and can be sent to the customer?",
//       buttons: [
//         {
//           text: 'Cancel',
//           handler: () => {
//
//           }
//         },
//         {
//           text: 'Confirm',
//           handler: () => {
//             this.db.getDocIDFromDataBase(item).subscribe(docid => {
//               this.db.updateClothStatus(docid, 'accepted').then(() => {
//                 this.offerClothesSeller = this.offerClothesSeller.filter(reservedItem => {
//                   return reservedItem.id != item;
//                   this.loadAvailableClothes();
//                 });
//               });
//             });
//           }
//         }
//       ]
//     });
//     confirm.present();
//   }
//
//   rejectRequest(item: any) {
//     const confirm = this.alertCtrl.create({
//       title: 'Are you sure you want to reject this request?',
//       message: "You have to reject this request if you can't find the product or you have already sold it in the store.",
//       buttons: [
//         {
//           text: 'Cancel',
//           handler: () => {
//             //DO NOTHING
//           }
//         },
//         {
//           text: 'Confirm',
//           handler: () => {
//             this.db.getDocIDFromDataBase(item).subscribe(docid => {
//               this.db.updateClothStatus(docid, 'available').then(() => {
//                 this.offerClothesSeller = this.offerClothesSeller.filter(reservedItem => {
//                   return reservedItem.id != item;
//                   this.loadAvailableClothes();
//                 });
//               });
//             });
//           }
//         }
//       ]
//     });
//     confirm.present();
//   }
//
//   payItem(articleId, sellerId, price, title){
//     console.log("id's:", articleId, sellerId, price);
//     this.navCtrl.push(SelectpaymentPage, {articleId: articleId, sellerId: sellerId, total: price, title: title})
//   }
//
//   openProductPage(clothId, tabTitle) {
//     this.navCtrl.push(ProductPage, { itemId: clothId, startingPoint: tabTitle });
//   }
//
//   uploadNewProduct() {
//     this.navCtrl.push(UploadpicturePage);
// }
//
//   switchToBuyView(){
//     new Promise(resolve => setTimeout(()=>resolve(), 1000)).then(()=>console.log("fired"));
//     this.navCtrl.setRoot(HomePage)
//   }
//
// }