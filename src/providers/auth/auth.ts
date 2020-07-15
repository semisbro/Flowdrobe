import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import * as firebase from "firebase";
import { StorageProvider } from "../storage/storage";
import { DatabaseProvider } from "../database/database";
import { Observable } from "rxjs";

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {
  constructor(
    public http: HttpClient,
    private storage: StorageProvider,
    private db: DatabaseProvider,
    public events: Events
  ) {}

  loginUser(email: string, password: string) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(signedUser => {
          if (signedUser) {
            this.storage
              .setData("signedToken", signedUser.uid)
              .subscribe(() => {});
            this.db.getUserFromDataBase(signedUser.uid).subscribe(user => {
              resolve(user.role);
            });
          }
        })
        .catch(error => {
          reject(error);
        });
    }).catch(error => {
      return error;
    });
  }

  signupUser(email: string, name: string, password: string, street: string, postalCode: number, city: string, phone: number): Promise<any> {
      console.log("sign up in auth")
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(newUser => {
        this.storage.setData("signedToken", newUser.uid).subscribe(() => {
          firebase
            .firestore()
            .collection("/users")
            .doc(newUser.uid)
            .set({
                email: email,
                name: name,
                role: "user",
                street: street,
                postalCode: postalCode,
                city: city,
                phone: phone,
                isSuperFlowster: false
            });
        });
      });
  }

  logoutUser(): Promise<void> {
    this.storage.removeData("signedToken").subscribe(() => {});
    this.events.publish("user:created", "signout");
    return firebase.auth().signOut();
  }
}
