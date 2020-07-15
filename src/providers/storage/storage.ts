import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { storage } from 'firebase';
import { GlobalProvider } from '../global/global';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {

  constructor(public http: HttpClient, private storage: Storage, private globalP: GlobalProvider) {
    
  }

  uploadToFirebase(_imageBlob, ref) {
    return new Promise((resolve, reject) => {
      let currentDate = new Date();

      let fileRef = storage()
                        .ref(this.globalP.storageName + "/" + ref);
      let uploadTask = fileRef.put(_imageBlob);
      uploadTask.on(
        "state_changed",
        (_snap: any) => {
          _snap.progress = (_snap.bytesTransferred / _snap.totalBytes) * 100
        },
        _error => {
          reject(_error);
        },
        () => {
          // completion...
          resolve(uploadTask.snapshot);
        }
      );
    });
  }

  setData(key: string, value: any) :Observable<any> {
    return Observable.create(observ => {
      this.storage.set(key, value).then(info => {
        observ.next(info);
        observ.complete();
      });
    });
  }

  getData(key: string) :Observable<any> {
    return Observable.create(observ => {
      this.storage.get(key).then(data => {
          observ.next(data);
          observ.complete();
      });
    });
  }

  removeData(key: string) :Observable<any> {
    return Observable.create(observ => {
      this.storage.remove(key).then(data => {
        observ.next(data);
        observ.complete();
      })
    })
  }


}
