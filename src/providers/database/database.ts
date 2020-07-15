import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { GlobalProvider } from '../global/global';
import * as firebase from 'firebase/app';

/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {
  private clothingCollection: AngularFirestoreCollection<any>;
  private filterDocument: AngularFirestoreDocument<any>;
  private storesCollection: AngularFirestoreCollection<any>;
  private filtersCollection: AngularFirestoreCollection<any>;
  private transactionsCollection: AngularFirestoreCollection<any>;
  private requestPickupCollection: AngularFirestoreCollection<any>;


  constructor(
    public http: HttpClient,
    public db: AngularFirestore,
    public globalP: GlobalProvider
  ) {
    this.clothingCollection = db.collection<any>(this.globalP.dbCollectionName);
    this.filterDocument = db.collection<any>('system').doc('filter');
    this.storesCollection = db.collection<any>('users');
    this.filtersCollection = db.collection<any>('filters');
    this.transactionsCollection = db.collection<any>('transactions');
    this.requestPickupCollection = db.collection<any>('requestPickup');
  }

  setBrandInDatabase(value: any): Observable<any> {
    return Observable.create(observable => {
      this.filtersCollection.add(value);
      observable.next(null);
      observable.complete();
    });
  }

  setNewTransactionItem(value: any): Observable<any> {
    return Observable.create(observable => {
      this.transactionsCollection.add(value);
      observable.next(null);
      observable.complete();
    });
  }

  setNewClothingItem(value: any): Observable<any> {
    return Observable.create(observable => {
      this.clothingCollection.add(value);
      observable.next(null);
      observable.complete();
    });
  }

  setNewRequestPickupItem(value: any): Observable<any> {
    return Observable.create(observable => {
      this.requestPickupCollection.add(value);
      observable.next(null);
      observable.complete();
    });
  }

  checkDocIDChanges(id: string): Observable<any> {
    if (id) {
      return this.db
        .collection<any>(this.globalP.dbCollectionName, ref =>
          ref.where('id', '==', id)
        )
        .snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            return a.payload.doc.id;
          });
        });
    }
    return;
  }

  getDocIDFromDataBase(id: string): Observable<any> {
    return Observable.create(observable => {
      this.checkDocIDChanges(id).subscribe(docid => {
        observable.next(docid);
        observable.complete();
      });
    });
  }

  checkSpecificClothChanges(id: string): Observable<any> {
    if (id) {
      return this.db
        .collection<any>(this.globalP.dbCollectionName, ref =>
          ref.where('id', '==', id)
        )
        .valueChanges();
    }
    return;
  }

  getSpecificClothFromDataBase(id: string): Observable<any> {
    return Observable.create(observable => {
      this.checkSpecificClothChanges(id).subscribe(sCloth => {
        console.log('TCL: DatabaseProvider -> sCloth', sCloth);
        observable.next(sCloth);
        observable.complete();
      });
    });
  }

  checkUserChanges(uid: string): Observable<any> {
    return this.db
      .collection<any>('users')
      .doc(uid)
      .valueChanges();
  }

  getUserFromDataBase(uid: string): Observable<any> {
    return Observable.create(observable => {
      this.checkUserChanges(uid).subscribe(user => {
        observable.next(user);
        observable.complete();
      });
    });
  }

  checkFiltersChanges(): Observable<any> {
    return this.filtersCollection.valueChanges();
  }

  getFiltersFromDataBase(): Observable<any> {
    return Observable.create(observable => {
      this.checkFiltersChanges().subscribe(filters => {
        observable.next(filters);
        observable.complete();
      });
    });
  }

  checkClothingChanges(): Observable<any> {
    return this.clothingCollection.valueChanges();
  }

  getClothingFromDataBase(): Observable<any> {
    return Observable.create(observable => {
      this.checkClothingChanges().subscribe(items => {
        observable.next(items);
        observable.complete();
      });
    });
  }

  checkFilterChanges(): Observable<any> {
    return this.filterDocument.valueChanges();
  }

  getFilterFromDataBase(): Observable<any> {
    return Observable.create(observable => {
      this.checkFilterChanges().subscribe(filters => {
        observable.next(filters);
        observable.complete();
      });
    });
  }

  checkStoresChanges(): Observable<any> {
    return this.storesCollection.valueChanges();
  }

  getStoresFromDataBase(): Observable<any> {
    return Observable.create(observable => {
      this.checkStoresChanges().subscribe(stores => {
        observable.next(stores);
        observable.complete();
      });
    });
  }

  checkAdminClothesChanges(userId, status): Observable<any> {
    if (userId && status) {
      return this.db
        .collection<any>(this.globalP.dbCollectionName, ref =>
          ref.where('uploader.uid', '==', userId).where('status', '==', status)
        )
        .valueChanges();
    }
    return;
  }

  getAdminClothesFromDataBase(userId, status): Observable<any> {
    return Observable.create(observable => {
      this.checkAdminClothesChanges(userId, status).subscribe(adminClothes => {
        observable.next(adminClothes);
        observable.complete();
      });
    });
  }

  checkBoughtClothesChanges(id, status): Observable<any> {
    if (id) {
      return this.db
        .collection<any>(this.globalP.dbCollectionName, ref =>
          ref.where('buyer.uid', '==', id).where('status', '==', status)
        )
        .valueChanges();
    }
    return;
  }

  getBoughtClothesFromDataBase(id, status): Observable<any> {
    return Observable.create(observable => {
      this.checkBoughtClothesChanges(id, status).subscribe(adminClothes => {
        observable.next(adminClothes);
        observable.complete();
      });
    });
  }

  updateClothStatus(document, value) {
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.update({
      status: value
    });
  }

  removeClothItem(document) {
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.delete().then(res => {
      return res;
    });
  }

  removeBlockTime(document) {
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.update({
      block: firebase.firestore.FieldValue.delete()
    });
  }

  updateWhislistNumber(document, value) {
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.update({
      whislists: value
    });
  }

  updateTutorialHasSeen(document, value) {
    let itemDoc = this.db.doc<any>(
      `users/${document}`
    );
    return itemDoc.update({
      tutorialHasSeen: value
    });
  }

  setBuyer(
    document,
    reference,
    currentDate,
    uid,
    offer,
    buyerName,
    buyerPhone,
    buyerCity,
    buyerPostalCode
  ) {
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.update({
      buyer: {
        offer: offer,
        ref: reference,
        time: currentDate,
        uid: uid,
        buyerName: buyerName,
        buyerPhone: buyerPhone,
        buyerCity: buyerCity,
        buyerPostalCode: buyerPostalCode
      }
    });
  }

  setBlock(document, blocktime, uid) {
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.update({
      block: {
        blocktime: blocktime,
        user: uid
      }
    });
  }

  setUsersRef(document, references) {
    let itemDoc = this.db.doc<any>(`users/${document}`);
    return itemDoc.update({
      refs: references
    });
  }

  selectedDetails = {
    colorDisplayName: '',
    condition: [],
    displayBrand: '',
    gender: [],
    type: [],
    img: [],
    color: [],
    title: '',
    brand: [],
    desc: '',
    size: {
      type: '',
      cSize: '',
      sSize: 0,
      kSize: 0,
      kSizeHelp: ''
    },
    id: '',
    price: 0,
    status: 'available',
    uploader: '',
    location: '',
    uploadDate: new Date().toISOString()
  };

  updateClothingData(document, data) {
    this.selectedDetails = data;
    let itemDoc = this.db.doc<any>(
      `${this.globalP.dbCollectionName}/${document}`
    );
    return itemDoc.update(this.selectedDetails);
  }

  userToUpdate = {
    city: '',
    email: '',
    name: '',
    postalCode: '',
    street: ''
  };

  updateUserData(document, data) {
    this.userToUpdate = data;
    let itemDoc = this.db.doc<any>(`users/${document}`);
    return itemDoc.update(this.userToUpdate);
  }

  // Notification part of database.
  userTokenToUpdate = {
    noToken: ''
  }
  updateNotificationToken(document, data) {
    this.userTokenToUpdate = data;
    let itemDoc = this.db.doc<any>(`users/${document}`);
    return itemDoc.update(this.userTokenToUpdate);
  }

  sendNotification(noToken, title, body) {

    let url = 'https://fcm.googleapis.com/fcm/send';

    let data = {
      notification: {
        title: title,
        body: body,
        sound: 'default',
        click_action: 'FCM_PLUGIN_ACTIVITY',
        icon: 'notification_icon'
      },
      to: noToken,
      priority: 'high',
      restricted_package_name: ''
    }

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'key=AAAAgkyzlIU:APA91bHEhQe-FHfNzeGbp7JVMHj_bPkYJY3AR-E_PhN3Okzw9amKMQYVQhosn_HuykivdSug0H3kFcDZsdnWIfLuk51-F-gbJ5jOUQaM0QO90kNhq9HN1RmJAddjioS-4fUfILFGlLUG'
      })
    };

    this.http.post(url, data, httpOptions)
      .map(response => {
        return response;
      }).subscribe(noti => {
        //post doesn't fire if it doesn't get subscribed to
        console.log(noti);
      });
  }

  getNotificationToken(document) {
    let itemDoc = this.db.doc<any>(`users/${document}`).ref.get();
    // return itemDoc.then(result => {
    //   console.log('FINALLY!: ' + result.get('noToken'));
    // });
    return itemDoc;
  }

}
