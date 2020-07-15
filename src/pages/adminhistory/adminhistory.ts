import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
//import {AdminhomePage} from '../adminhome/adminhome';
import {StorageProvider} from "../../providers/storage/storage";
import {DatabaseProvider} from "../../providers/database/database";
import {ProductPage} from "../product/product";
import {HomePage} from "../home/home";
import { ImageService } from '../../services/image-Service';

@IonicPage()
@Component({
  selector: 'page-adminhistory',
  templateUrl: 'adminhistory.html',
})
export class AdminhistoryPage {

  soldClothes: Array<any> = []
  deletedClothes: Array<any> = []
  boughtClothes: Array<any> = [];

  //reservedClothesUsers: Array<any> = []
  userId: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private storage: StorageProvider,
              private db: DatabaseProvider,
              private imageService: ImageService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminhistoryPage');
  }

  ionViewWillEnter() {

    this.storage.getData('signedToken').subscribe(userID => {
      if (!userID) {
        return;
      } else {
        this.db.getUserFromDataBase(userID).subscribe(user => {
          if (!user) {
            return;
          } else {
            this.userId = userID
            this.loadAvailableClothes()
          }
        })
      }
    })
  }

  loadAvailableClothes() {

    this.db.getAdminClothesFromDataBase(this.userId, 'bought').subscribe(soldClothes => {

      this.soldClothes = soldClothes;

      this.soldClothes.map(item => {
        if (item && item.img && item.img[0]) {
          this.imageService.getImageURL(item.img[0]).then(url => {
            item.cardImg = 'url(' + url + ')';
          });
        }
      });

      this.db.getAdminClothesFromDataBase(this.userId, 'deleted').subscribe(delClothes => {

        this.deletedClothes = delClothes;

        this.deletedClothes.map(item => {
          if (item && item.img && item.img[0]) {
            this.imageService.getImageURL(item.img[0]).then(url => {
              item.cardImg = 'url(' + url + ')';
            });
          }
        });
      });

      this.db.getBoughtClothesFromDataBase(this.userId, "bought").subscribe(res =>{
        this.boughtClothes = res;

        this.boughtClothes.map(item => {
          if (item && item.img && item.img[0]) {
            this.imageService.getImageURL(item.img[0]).then(url => {
              item.cardImg = 'url(' + url + ')';
            });
          }
        });
      })

      /*this.db.getAdminClothesFromDataBase(this.userId, 'reserved').subscribe(resClothes => {
        this.reservedClothes = resClothes
        let i = 0;

        let promise = new Promise((resolve, reject) =>{
          this.reservedClothes.map(item => {
            console.log("item title:", item.title)
            //this.reservedClothesUsers[i].title = '' + item.title
            //console.log("reserved cloth users title:", this.reservedClothesUsers[i].title)
            if (item && item.img && item.img[0]) {
              firebase.storage().ref().child(`${this.globalP.storageName}/${item.img[0]}`).getDownloadURL().then(url => {
                item.cardImg = 'url(' + url + ')';
                //this.reservedClothesUsers[i].cardImg = 'url(' + url + ')';
                console.log("index:", i)
                i += 1;
                console.log("value of i:", i, " length of reservedClothes", this.reservedClothes.length)
                if (i === this.reservedClothes.length)
                  return resolve(true)

              });
            }
          });
        }).then(res => {
          resClothes.forEach(async (element, index) =>{
            await this.db.getUserFromDataBase(element.buyer.uid).subscribe( res =>{
              //console.log("Reserved clothes", JSON.stringify(this.reservedClothes[index]))
              //console.log("reservedClothes index cardImg:", this.reservedClothes[index].cardImg)
              res.cardImg = this.reservedClothes[index].cardImg
              res.title = this.reservedClothes[index].title
              console.log("res cardImg:", res.cardImg)
              console.log("res title:", res.title)
              this.reservedClothesUsers.push(res)
            })
          })
        })
      });*/

      /*this.availableClothes["uploadDate "].sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      })*/
    });
  }

  reactivateItem(id){
    this.db.getDocIDFromDataBase(id).subscribe(res =>{
      this.db.updateClothStatus(res, "available").then(res =>{
        this.loadAvailableClothes()
      })
    })
  }

  openProductPage(clothId) {
    this.navCtrl.push(ProductPage, { itemId: clothId});
  }

  openHomePage() {
    this.navCtrl.setRoot(HomePage);
  }
}
