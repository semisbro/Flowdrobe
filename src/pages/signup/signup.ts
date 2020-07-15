import {Component, ElementRef} from '@angular/core';
import {IonicPage, NavController, NavParams, Events, AlertController} from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

import { Platform } from 'ionic-angular';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { StorageProvider } from '../../providers/storage/storage';

import { EmailValidator } from '../../validators/email';
import {DatabaseProvider} from "../../providers/database/database";

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  loggedName: string = '';
  loggedEmail: string = '';

  userToEdit: Array<any> = [];
  userUid:any;

  tempProperty: any;

  tempObj: boolean = false;

  isEdit: boolean = false;


  public signupForm: FormGroup;
  public submitAttempt: boolean = false;

  getControlName(name): any { return this.signupForm.get(name); }

  constructor(
    private afAuth: AngularFireAuth,
    private platform: Platform,
    public navCtrl: NavController,
    public authProvider: AuthProvider,
    public formBuilder: FormBuilder,
    private storage: StorageProvider,
    public events: Events,
    private navParams: NavParams,
    private db: DatabaseProvider,
    private alert: AlertController,
    public elementRef: ElementRef
  ) {

    this.signupForm = formBuilder.group({
      email: ['', Validators.compose([EmailValidator.isValid, Validators.required, Validators.maxLength(256)])],
      name: ['', Validators.compose([Validators.pattern('[a-zA-Z ]*'), Validators.required, Validators.maxLength(256)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(256)])],
      street: ['', Validators.compose([Validators.required])],
      postalCode: ['', Validators.compose([Validators.required, Validators.min(4), Validators.maxLength(4)])],
      city: ['', Validators.compose([Validators.required])],
        phone: ['', Validators.compose([Validators.required, Validators.min(8), Validators.maxLength(8)])]

    });
  }

  ionViewWillEnter(){
    if (this.navParams.get("isEdit")){
      this.isEdit = this.navParams.get("isEdit")
      this.storage.getData("signedToken").subscribe(uid =>{
        this.userUid = uid;
        console.log("uid", uid)
        this.db.getUserFromDataBase(uid).subscribe(user =>{
          this.userToEdit = user;
          console.log("user", user)
          console.log()
          this.getControlName("email").setValue(this.userToEdit["email"])
          this.getControlName("name").setValue(this.userToEdit["name"])
          this.getControlName("street").setValue(this.userToEdit["street"])
          this.getControlName("postalCode").setValue(this.userToEdit["postalCode"])
          this.getControlName("city").setValue(this.userToEdit["city"])
          this.getControlName("phone").setValue(this.userToEdit["phone"]);
          (this.elementRef.nativeElement.querySelectorAll('ion-item') as HTMLElement[]).forEach((x) => {
            x.classList.remove('ng-untouched');
            x.classList.add('ng-valid');
          });
        })
      })
    }
  }

  signUp() {
    this.submitAttempt = true;

    if (this.signupForm.valid) {
      this.authProvider.signupUser(
          this.signupForm.controls.email.value,
          this.signupForm.controls.name.value,
          this.signupForm.controls.password.value,
          this.signupForm.controls.street.value,
          this.signupForm.controls.postalCode.value,
          this.signupForm.controls.city.value,
          this.signupForm.controls.phone.value
      ).then((succ) => {
        console.log("signed up user!")
          this.delay(10).then(() => {
            this.events.publish('user:created', 'user');
            this.navCtrl.push(HomePage);
          })
      }, (error) => {
        console.log('sww', error);
      });

    }else{
      this.signupformInvalidAlert();
    }
  }

  updateUserInfo(){
    this.submitAttempt = true
    this.signupForm.get("password").disable({ emitEvent: false })
    if (this.signupForm.valid) {
      this.db.updateUserData(this.userUid, this.userToEdit).then(res => {
        this.navCtrl.setRoot(HomePage);
      })
    }else{
      this.signupformInvalidAlert()
    }

  }

  resetText(event){
    if(!this.tempObj){
      var eventId = event.path["1"].id
      this.tempProperty = this.userToEdit[eventId]
    this.userToEdit[eventId] = '';
    }else{
      this.delay(200)
      this.resetText(event);
    }
    this.tempObj = true
  }


  focusOut(event){

    const formName = event.path["1"].id
    const form = this.getControlName(formName)

    if(form.status === "INVALID" && form.value === '') {

      form.setValue(this.tempProperty);

      (this.elementRef.nativeElement.querySelectorAll('ion-item') as HTMLElement[]).forEach((x) => {
        if(x.querySelector(`#${formName}`) !== null && typeof (x.querySelector(`#${formName}`) !== undefined)) {
          x.classList.remove('ng-invalid');
          x.classList.add('ng-valid');
        }
      });
    }
    else if (form.status === "INVALID" && form.value !== ''){
      (this.elementRef.nativeElement.querySelectorAll('ion-item') as HTMLElement[]).forEach((x) => {
        if(x.querySelector(`#${formName}`) !== null && typeof (x.querySelector(`#${formName}`) !== undefined)) {
          x.classList.remove('ng-valid');
          x.classList.add('ng-invalid');
        }
      });
    }
    this.tempObj = false;
  }

  signOut() {
    this.afAuth.auth.signOut();

    this.loggedName = '';
    this.loggedEmail = '';
  }

  signupformInvalidAlert(){
    const alert = this.alert.create({
      subTitle: "One or more of your fields are invalid. Please try again!",
      buttons: [{
        text: 'OK',
        handler: () => {
          return;
        }
      }]
    });
    alert.present();
}

  openFRPage(){
    console.log("FR page!!!!!")
  }

  openLoginPage() {
    if(this.isEdit)
    {
      this.navCtrl.setRoot(HomePage)
    }else{
      this.navCtrl.push(LoginPage);
    }

  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  openBecomeSuperFlowster() {
      window.open('http://flowrobe.com/', '_system')
  }
  
}
