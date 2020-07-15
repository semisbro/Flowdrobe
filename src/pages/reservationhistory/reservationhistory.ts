import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { GlobalProvider } from '../../providers/global/global';
import { Observable } from 'rxjs';
import { HomePage } from '../home/home';
import { ImageService } from '../../services/image-Service';

@IonicPage()
@Component({
  selector: 'page-reservationhistory',
  templateUrl: 'reservationhistory.html',
})
export class ReservationhistoryPage {

  refHistory: Array<any> = []

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: StorageProvider, private db: DatabaseProvider, private globalP: GlobalProvider, private imageService: ImageService) {
    this.storage.getData("signedToken").subscribe(uid=>{
      if(uid) {
        this.db.getClothingFromDataBase().subscribe(dbItems=>{
          if(dbItems) {
            this.db.getStoresFromDataBase().subscribe(stores=>{
              if(stores) {
                let refHistoryAux = []
                dbItems.map(item=>{
                  if(item && item.buyer && item.buyer.uid && item.buyer.uid === uid) {
                    if(item.buyer.ref) {
                      item['refNum'] = item.buyer.ref
                    }

                    if(item.buyer.time) {
                      item['refDate'] = item.buyer.time
                    }
                    
                    if(item.status) {
                      switch (item.status) {
                        case 'reserved':
                            item['displayedStatus'] = 'Waiting for confirmation'
                            item['myColor'] = '#efca27'
                          break;
                        case 'sold':
                          item['displayedStatus'] = 'Confirmed'
                          item['myColor'] = '#28efad'
                          break;
                        case 'denied':
                          item['displayedStatus'] = 'Rejected'
                          item['myColor'] = '#ed5569'
                          break;
                        default:
                          break;
                      }
                    } else {
                      item['displayedStatus'] = 'Waiting for confirmation'
                      item['myColor'] = '#efca27'
                    }
                    
                    stores.map(store=>{
                      if(store && store.id && store.id === item.uploader) {
                        if(store.street) {
                          item['street'] = store.street
                        }
                        if(store.postalcode) {
                          item['postalCode'] = store.postalcode
                        }
                        if(store.city) {
                          item['city'] = store.city
                        }
                      }
                    })

                    refHistoryAux.push(item)
                  }
                })
                this.refHistory = this.transform(refHistoryAux, 'refNum')
                this.refHistory.map((refGroup, index)=> {
                  if(!refGroup || !refGroup.key || !refGroup.value) return
                  let totalValue = 0
                  refGroup.value.map(item=>{
                    if(item.img && item.img[0]) {
                      this.setImgUrl(item.img[0]).subscribe(img=>{
                        item['displayedImg'] = img
                      })
                    }
                    if(!item || !item.price) return
                    totalValue += parseFloat(item.price)
                  })
                  this.refHistory[index]['productValue'] = totalValue
                  if(globalP.shippingPrice && globalP.buyerProtection) {
                    this.refHistory[index]['totalValue'] = totalValue + globalP.shippingPrice + globalP.buyerProtection
                  } else {
                    this.refHistory[index]['totalValue'] = totalValue + 27.5
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  transform(collection: Array<any>, property: string): Array<any> {
    if(!collection) {
      return null;
    }

    const groupedCollection = collection.reduce((previous, current)=> {
      if(!previous[current[property]]) {
          previous[current[property]] = [current];
      } else {
          previous[current[property]].push(current);
      }

      return previous;
    }, {});

    return Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
  }

  setImgUrl(imageName: string): Observable<string> {

    return Observable.create(observ => {
      this.imageService.getImageURL(imageName).then(url => {
        observ.next(url);
        observ.complete();
      });
    });
  }

  ionViewDidLoad() {
  }

  openHomePage() {
    this.navCtrl.setRoot(HomePage);
  }

}
