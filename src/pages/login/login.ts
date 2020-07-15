import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { StorageProvider } from '../../providers/storage/storage';
import { EmailValidator } from '../../validators/email';
import { DatabaseProvider } from '../../providers/database/database';
import {SelectcategoryPage} from "../selectcategory/selectcategory";
import {MarketplacePage} from "../marketplace/marketplace";

declare var window: any;

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForm: FormGroup;
  public submitAttempt: boolean = false;
  authError: Array<boolean|string> = [false, ''];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public authProvider: AuthProvider,
    public formBuilder: FormBuilder,
    private storage: StorageProvider,
    private db: DatabaseProvider,
    public events: Events,
  ) {
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([EmailValidator.isValid, Validators.required, Validators.maxLength(256)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(256)])]
    });
  }

  ionViewWillEnter() {
    this.storage.getData('signedToken').subscribe(userID => {
      if (userID) {
        console.log("userid login ts", userID)
        this.db.getUserFromDataBase(userID).subscribe(user => {
            this.navCtrl.push(HomePage);
        })
      }
    })
  }

  login() {
    this.submitAttempt = true;

    if(this.loginForm.valid) {
      this.authProvider.loginUser(this.loginForm.controls.email.value, this.loginForm.controls.password.value).then(data=>{
        if(data) {
          if(data.code) {
            switch(data.code) {
              case 'auth/user-not-found':
                this.authError[0] = true;
                this.authError[1] = 'Wrong email address or password';
              break;
              case 'auth/wrong-password':
                this.authError[0] = true;
                this.authError[1] = 'Wrong email address or password';
              break;
              default:
                this.authError[0] = true;
                this.authError[1] = 'An error occured, please try again later';
            }
          } else {
            if(data === 'user') {

              this.removeFromWishlistOwnedItems();

              if(this.navParams.get("selectedDetails")){
                this.navCtrl.push(SelectcategoryPage,
                    {selectedDetails: this.navParams.get("selectedDetails"),
                      DbFilters: this.navParams.get("DbFilters"),
                    photos: this.navParams.get("photos")})
              }
              else if(this.navParams.get("isWishlistLoginAttempt")){
                this.delay(100).then(res => {
                  this.navCtrl.push(MarketplacePage, {card: this.navParams.get("card"), isWishlistLoginAttempt: true})
                  return;
                })

              }
              this.events.publish('user:created', 'user');
              this.navCtrl.pop()
            } else {
              this.navCtrl.setRoot(LoginPage);
            }
          }
        } else {
          this.authError[0] = true;
          this.authError[1] = 'An error occured, please try again later';
        }
      })
    }
  }

  removeFromWishlistOwnedItems() {
    this.storage
    .getData("signedToken")
    .subscribe(uid => {
      this.storage.getData('swipedCards').subscribe(swipedCards => {
        if (swipedCards) {
        console.log(swipedCards)
        let Items = swipedCards.filter(function (card) {
            return card.uploader != uid;
        });

          console.log(Items);
          this.storage
            .setData('swipedCards', Items)
            .subscribe(info => { });
        }
      });
    
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  openHomePage() {
    this.navCtrl.push(HomePage);
  }

  openSignupPage() {
    this.navCtrl.push(SignupPage);
  }

}
