import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    AlertController,
    ModalController, ToastController
} from 'ionic-angular';

import {DatabaseProvider} from '../../providers/database/database';
import {GlobalProvider} from '../../providers/global/global';
import {StorageProvider} from '../../providers/storage/storage';
import {Observable} from 'rxjs';
import {MarketplacePage} from '../marketplace/marketplace';
import {HomePage} from '../home/home';

import {ImageService} from '../../services/image-Service';
import {ImageViewerPage} from '../image-viewer/image-viewer';
import {PopoverController} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {CallNumber} from "@ionic-native/call-number/ngx";


//import { AdminhomePage } from '../adminhome/adminhome';

@IonicPage()
@Component({
    selector: 'page-product',
    templateUrl: 'product.html'
})
export class ProductPage {
    product: Array<string | Array<string>> = [];
    slider: Array<Object> = [];
    fromCart: boolean = false;
    startingPoint: string = '';
    sellerName: any;
    user: any
    sellerNumber: any
    sellerEmail: any;
    sellerLocation: any;
    currentUserUid: string;

    constructor(
        public popoverController: PopoverController,
        public modalController: ModalController,
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        public    toastController: ToastController,
        private storage: StorageProvider,
        public db: DatabaseProvider,
        private imageService: ImageService,
        private callNumber: CallNumber
    ) {
        this.startingPoint = navParams.get('startingPoint');
        if (navParams.get('startingPoint') === 'cart') {
            this.fromCart = true;
        } else {
            this.fromCart = false;
        }
        this.storage.getData('signedToken').subscribe(sub => {
            this.currentUserUid = sub as string;
        });


        this.db
            .getSpecificClothFromDataBase(navParams.get('itemId'))
            .subscribe(product => {
                if (product) {
                    this.product = product[0];
                    console.log('product:', JSON.stringify(this.product));
                    this.sellerName = this.product['uploader']['name'];
                    this.sellerNumber = this.product['uploader']['phone'];
                    this.sellerLocation = this.product['uploader']['city'];
                    this.sellerEmail = this.product['uploader']['uid']
                    this.db.getUserFromDataBase(this.sellerEmail).subscribe(user => {
                            this.user = user[0]
                            this.sellerEmail = user["email"]
                            console.log('product:', JSON.stringify(this.product));
                            console.log('product:', JSON.stringify(this.product));
                        }
                    )


                    if (this.product['img']) {
                        this.imageService.getImagesURLs(this.product['img']).then(urls =>
                            urls.forEach(url =>
                                this.slider.push({
                                    image: url
                                })
                            )
                        );
                    }

                    if (
                        this.product['price'] &&
                        typeof this.product['price'] !== 'undefined'
                    ) {
                        this.product['price'] = parseFloat(this.product['price']);
                    }

                    this.db.getFiltersFromDataBase().subscribe(filters => {
                        if (filters) {
                            filters.map(filter => {
                                if (
                                    typeof filter.filter !== 'undefined' &&
                                    filter.filter === 'size'
                                ) {
                                    if (
                                        typeof filter.name !== 'undefined' &&
                                        typeof filter.displayName !== 'undefined' &&
                                        typeof this.product['size'] !== 'undefined'
                                    ) {
                                        if (
                                            filter.name === this.product['size'] &&
                                            this.product['size']['type'] === 'cSize'
                                        ) {
                                            this.product['sizeDisplayName'] = filter.displayName;
                                        }

                                        if (this.product['size']['type'] === 'sSize') {
                                            this.product['sizeDisplayName'] = this.product['size'][
                                                'value'
                                                ];
                                        }

                                        if (
                                            filter.name === this.product['size'] &&
                                            this.product['size']['type'] === 'kSize'
                                        ) {
                                            this.product['sizeDisplayName'] =
                                                filter.name + ' (' + filter.displayName + ')';
                                        }
                                    }
                                }

                                if (
                                    typeof filter.filter !== 'undefined' &&
                                    filter.filter === 'brand'
                                ) {
                                    if (
                                        typeof filter.name !== 'undefined' &&
                                        typeof filter.displayName !== 'undefined' &&
                                        filter.name === this.product['brand'][0]
                                    ) {
                                        this.product['brandDisplayName'] = filter.displayName;
                                    }
                                }

                                if (
                                    typeof filter.filter !== 'undefined' &&
                                    filter.filter === 'type'
                                ) {
                                    if (
                                        typeof filter.name !== 'undefined' &&
                                        typeof filter.displayName !== 'undefined' &&
                                        filter.name === this.product['type'][0]
                                    ) {
                                        this.product['typeDisplayName'] = filter.displayName;
                                    }
                                }

                                if (
                                    typeof filter.filter !== 'undefined' &&
                                    filter.filter === 'gender'
                                ) {
                                    if (
                                        typeof filter.name !== 'undefined' &&
                                        typeof filter.displayName !== 'undefined' &&
                                        filter.name === this.product['gender'][0]
                                    ) {
                                        this.product['genderDisplayName'] = filter.displayName;
                                    }
                                }

                                if (
                                    typeof filter.filter !== 'undefined' &&
                                    filter.filter === 'condition'
                                ) {
                                    if (
                                        typeof filter.name !== 'undefined' &&
                                        typeof filter.displayName !== 'undefined' &&
                                        filter.name === this.product['condition'][0]
                                    ) {
                                        this.product['conditionDisplayName'] = filter.displayName;
                                    }
                                }
                            });
                        }
                    });
                }
            });
    }

    async zoomImage(image?) {
        const modal = await this.modalController.create(ImageViewerPage, {image});
        return await modal.present();
    }

    async presentToast() {
        const toast = await this.toastController.create({
            message: 'Your settings have been saved.',
            duration: 2000
        });
        toast.present();
    }

    callUser() {
        console.log(this.sellerNumber)
        window.open(`tel:` + this.sellerNumber, '_system');


    }

    sendEmail() {
        window.open(`mailto:` + this.sellerEmail, '_system');
    }


    addToCart(id) {
        this.storage.getData('signedToken').subscribe(sub => {
            if (!sub) {
                this.navCtrl.push(LoginPage, {
                    id: id
                });
                //this.addToCartLogin(id)
            } else {
                this.addToCartLogin(id)
            }
        });
    }

    addToCartLogin(id) {
        let newCartItem = {
            id: id,
            imgUrl: '',
            description: '',
            title: '',
            price: 0,
            brand: '',
            condition: '',
            uploader: '',
            intention: 0,
            status: 0
        };

        this.db.getSpecificClothFromDataBase(id).subscribe(cloth => {
            if (cloth) {
                cloth = cloth[0];
                if (cloth.img) {
                    this.setImgUrl(cloth.img[0]).subscribe(url => {
                        if (url) {
                            newCartItem.imgUrl = 'url(' + url + ')';
                        }

                        if (cloth.description) {
                            newCartItem.description = cloth.description;
                        }

                        if (cloth.title) {
                            newCartItem.title = cloth.title;
                        }

                        if (cloth.price) {
                            newCartItem.price = cloth.price;
                        }

                        if (cloth.brand) {
                            newCartItem.brand = cloth.brand;
                        }

                        if (cloth.condition) {
                            newCartItem.condition = cloth.condition;
                        }

                        if (cloth.uploader['uid']) {
                            newCartItem.uploader = cloth.uploader.uid;
                        }

                        this.storage.getData('cartItems').subscribe(cartItems => {
                            if (!cartItems) cartItems = [];
                            cartItems.push(newCartItem);
                            this.storage.setData('cartItems', cartItems).subscribe(() => {
                                this.storage.getData('swipedCards').subscribe(swipedCards => {
                                    if (!swipedCards) swipedCards = [];

                                    let isIn = false;
                                    swipedCards.map(sCard => {
                                        if (
                                            sCard &&
                                            typeof sCard.id !== 'undefined' &&
                                            sCard.id === newCartItem.id
                                        ) {
                                            sCard.intention = 0;
                                            isIn = true;
                                        }
                                    });

                                    if (!isIn) swipedCards.push(newCartItem);

                                    this.storage
                                        .setData('swipedCards', swipedCards)
                                        .subscribe(() => {
                                            this.navCtrl.push(MarketplacePage, {
                                                tab: 'cart',
                                                rootHome: true
                                            });
                                        });
                                });
                            });
                        });
                    });
                }
            }
        });
    }

    addToWishList(id) {
        let newCartItem = {
            id: id,
            imgUrl: '',
            description: '',
            title: '',
            price: 0,
            brand: '',
            condition: '',
            uploader: '',
            intention: 0,
            status: 0
        };

        this.db.getSpecificClothFromDataBase(id).subscribe(cloth => {
            if (cloth) {
                cloth = cloth[0];
                if (cloth.img) {
                    this.setImgUrl(cloth.img[0]).subscribe(url => {
                        if (url) {
                            newCartItem.imgUrl = 'url(' + url + ')';
                        }

                        if (cloth.description) {
                            newCartItem.description = cloth.description;
                        }

                        if (cloth.title) {
                            newCartItem.title = cloth.title;
                        }

                        if (cloth.price) {
                            newCartItem.price = cloth.price;
                        }

                        if (cloth.brand) {
                            newCartItem.brand = cloth.brand;
                        }

                        if (cloth.condition) {
                            newCartItem.condition = cloth.condition;
                        }

                        if (cloth.uploader.uid) {
                            newCartItem.uploader = cloth.uploader.uid;
                        }
                        this.storage.getData('swipedCards').subscribe(swipedCards => {
                            if (!swipedCards) swipedCards = [];

                            let isIn = false;
                            swipedCards.map(sCard => {
                                if (
                                    sCard &&
                                    typeof sCard.id !== 'undefined' &&
                                    sCard.id === newCartItem.id
                                ) {
                                    isIn = true;
                                }
                            });

                            if (!isIn) {
                                newCartItem.intention = 1;
                                swipedCards.push(newCartItem);
                            }

                            console.log('swiped cards:', JSON.stringify(swipedCards));

                            this.storage.setData('swipedCards', swipedCards).subscribe(() => {
                                this.increaseWhislistsNumber(newCartItem.id);
                                this.navCtrl.setRoot(HomePage);
                            });
                        });
                    });
                }
            }
        });
    }

    increaseWhislistsNumber(id) {
        if (!id) return;

        this.db.getSpecificClothFromDataBase(id).subscribe(cloth => {
            if (!cloth) return;

            if (typeof cloth[0].whislists === 'undefined') {
                cloth[0].whislists = 1;
            } else {
                cloth[0].whislists++;
            }

            this.db.getDocIDFromDataBase(id).subscribe(docId => {
                if (!docId[0]) return;
                this.db.updateWhislistNumber(docId[0], cloth[0].whislists);
            });
        });
    }

    setImgUrl(imageName: string): Observable<string> {
        return Observable.create(observ => {
            this.imageService.getImageURL(imageName).then(url => {
                observ.next(url);
                observ.complete();
            });
        });
    }

    showAlert() {
        const alert = this.alertCtrl.create({
            subTitle:
                'This item will be removed from the wardrobe, you can find it in the admin history hereafter.',
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        this.navCtrl.push(MarketplacePage);
                    }
                }
            ]
        });
        alert.present();
    }

    hasBeenSold(id) {
        this.db.getDocIDFromDataBase(id).subscribe(docId => {
            if (docId) {
                this.db.updateClothStatus(docId, 'denied').then(() => {
                    this.showAlert();
                });
            }
        });
    }

    back() {
        this.navCtrl.getPrevious().data.comeFrom = "dontrefresh"
        this.navCtrl.pop()
    }

    isOwnProduct(product: any) {
        return product.uploader && product.uploader.uid == this.currentUserUid;
    }
}
