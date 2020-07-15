import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {SignupPage} from '../pages/signup/signup';

import {HttpClientModule} from '@angular/common/http';
import {SwingModule} from 'angular2-swing';

import {AngularFireModule} from 'angularfire2';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth';
import {firebaseConfig} from './credentials';
import {ReactiveFormsModule} from '@angular/forms';

import {GooglePlus} from '@ionic-native/google-plus';

import {IonicStorageModule} from '@ionic/storage';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {DatabaseProvider} from '../providers/database/database';
import {StorageProvider} from '../providers/storage/storage';
import {MarketplacePage} from '../pages/marketplace/marketplace';
import {FilterPage} from '../pages/filter/filter';
import {ErrorPage} from '../pages/error/error';
//import { AdminhomePage } from '../pages/adminhome/adminhome';
import {LoginPage} from '../pages/login/login';
import {ProductPage} from '../pages/product/product';
import {SelectpaymentPage} from '../pages/selectpayment/selectpayment';
import {PaymentPage} from '../pages/payment/payment';
import {InvoicePage} from '../pages/invoice/invoice';
import {OrderconfirmationPage} from '../pages/orderconfirmation/orderconfirmation';
import {ReservationhistoryPage} from '../pages/reservationhistory/reservationhistory';
import {SearchPage} from '../pages/search/search';
import {AdminhistoryPage} from '../pages/adminhistory/adminhistory';
import {UploadconfirmationPage} from '../pages/uploadconfirmation/uploadconfirmation';
import {MeetusPage} from '../pages/meetus/meetus';
import {ModalController} from "ionic-angular";
import {AccordionComponent} from '../components/accordion/accordion';
import {BrMaskerModule} from 'brmasker-ionic-3';
import {SwipeCardsModule} from 'ion-swipe-cards';
import {Network} from '@ionic-native/network';
import {AuthProvider} from '../providers/auth/auth';
import {UploadpicturePage} from '../pages/uploadpicture/uploadpicture';
import {SelectcategoryPage} from '../pages/selectcategory/selectcategory';
import {Camera} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {GlobalProvider} from '../providers/global/global';
import {MobilePayMessagesProvider} from '../providers/mobilepay/mobilepay';
import {FCM} from '@ionic-native/fcm';
import {ToastController} from 'ionic-angular';
import {Base64} from '@ionic-native/base64';
import {PickupChosserPage} from '../pages/pickup-chosser/pickup-chosser';
import {ImageService} from '../services/image-Service';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {ImageViewerPage} from '../pages/image-viewer/image-viewer';
import {ImageViewerPageModule} from '../pages/image-viewer/image-viewer.module';
import {TutorialPage} from '../pages/tutorial/tutorial';


@NgModule({
    declarations: [
        MyApp,
        //AdminhomePage,
        LoginPage,
        HomePage,
        TutorialPage,
        SignupPage,

        MarketplacePage,
        ProductPage,
        ErrorPage,
        SelectpaymentPage,
        ReservationhistoryPage,
        OrderconfirmationPage,
        UploadconfirmationPage,
        AdminhistoryPage,
        InvoicePage,
        PaymentPage,
        SearchPage,
        FilterPage,
        SelectcategoryPage,
        UploadpicturePage,
        AccordionComponent,
        MeetusPage,
        PickupChosserPage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        SwingModule,
        SwipeCardsModule,
        BrMaskerModule,

        IonicModule.forRoot(MyApp, {scrollAssist: false, autoFocusAssist: true}),
        IonicStorageModule.forRoot(),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule,
        ReactiveFormsModule,
        ImageViewerPageModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,

        HomePage,
        TutorialPage,
        SignupPage,
        MarketplacePage,
        ProductPage,
        ErrorPage,
        FilterPage,
        AdminhistoryPage,
        InvoicePage,
        SearchPage,
        OrderconfirmationPage,
        ReservationhistoryPage,
        UploadconfirmationPage,
        SelectpaymentPage,
        PaymentPage,
        //AdminhomePage,
        SelectcategoryPage,
        LoginPage,
        UploadpicturePage,
        MeetusPage,
        PickupChosserPage,
        ImageViewerPage
    ],
    providers: [
        StatusBar,
        GooglePlus,
        SplashScreen,
        CallNumber,
        FCM,
        ModalController,

        ToastController,

        {provide: ErrorHandler, useClass: IonicErrorHandler},
        DatabaseProvider,
        StorageProvider,
        AngularFireAuth,
        Network,
        AuthProvider,
        Camera,
        File,
        GlobalProvider,
        Base64,
        MobilePayMessagesProvider,
        ImageService,
        InAppBrowser
    ],
    exports: []
})
export class AppModule {
}
