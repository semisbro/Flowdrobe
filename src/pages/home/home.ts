import {
    Component,
    ViewChild,
    ViewChildren,
    QueryList,
    EventEmitter,
    ModuleWithComponentFactories
} from '@angular/core';
import {DatabaseProvider} from '../../providers/database/database';
import {StorageProvider} from '../../providers/storage/storage';
import {HttpClientModule} from '@angular/common/http';
import {AlertController, ModalController, ToastController} from "ionic-angular";
import {DomSanitizer} from '@angular/platform-browser';

import 'rxjs/Rx';

import {NavController, Events, Platform, NavParams, Alert} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {MarketplacePage} from '../marketplace/marketplace';
import {Observable} from 'rxjs/Observable';
import {FilterPage} from '../filter/filter';
import {ProductPage} from '../product/product';
//import { AdminhomePage } from '../adminhome/adminhome';
import {GlobalProvider} from '../../providers/global/global';
import {ImageService} from '../../services/image-Service';
import {FCM} from '@ionic-native/fcm';
import {ModalPageInterestReceivedPage} from "../modal-page-interest-received/modal-page-interest-received";
import {Modal} from "ionic-angular";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    moved: string = '';
    liked: boolean = false;
    disliked: boolean = false;
    isEnabled: boolean = true;
    badgeNumber: number = 0;
    animationController: boolean = false;

    loggedInUser: any;

    wardrobe: Array<string | any> = [];
    cardDirection = 'xy';
    cardOverlay: any = {
        like: {
            backgroundImage: 'url("assets/imgs/likefade.png")'
        },
        dislike: {
            backgroundImage: 'url("assets/imgs/dislikefade.png")'
        }
    };
    latestSwipedCard: any = '';
    ready: boolean = false;
    isIntentionButtonsReady: boolean;
    isRetriveButtonReady: boolean;
    retriveHelper: number = 0;

    swipedCardsEmpty: boolean = false;

    style: Array<string> = ['everyday', 'sport'];
    type: Array<string> = ['tshirts', 'pants'];

    selectedFilters: Array<any> = [];

    constructor(
        public http: HttpClientModule,
        private db: DatabaseProvider,
        public navCtrl: NavController,
        private storage: StorageProvider,
        private sanitizer: DomSanitizer,
        private globalP: GlobalProvider,
        private modalController: ModalController,
        private alertController: AlertController,
        public events: Events,
        private platform: Platform,
        private imageService: ImageService,
        private toastController: ToastController,
        private navParams: NavParams,
        private fcm: FCM
    ) {
        this.isIntentionButtonsReady = true;
        this.isRetriveButtonReady = true;

    }

    async presentToast() {
        const toast = await this.toastController.create({
            message: 'Your settings have been saved.',
            duration: 2000
        });
        toast.present();
    }

    ionViewWillEnter() {
        console.log('Hey');
        this.platform.ready().then(rdy => {
            // this.storage.getData('signedToken').subscribe(userID => {
            //   if (userID) {
            //     let kadabra = this.db.getUserFromDataBase(userID).subscribe(() => {
            //       alert('THIS IS KADABRA ' + kadabra);
            //       console.log(kadabra);
            //     });

            //   }
            // });


            // get FCM token
            this.fcm.getToken().then(token => {
                console.log(token);
                let newToken = {
                    noToken: token
                };
                this.storage.getData('signedToken').subscribe(userID => {
                    if (userID) {
                        this.loggedInUser = userID;
                        this.db.updateNotificationToken(this.loggedInUser, newToken)
                    }
                });
            });

            // // ionic push notification exfample
            this.fcm.onNotification().subscribe(data => {
                console.log(data);
                if (data.wasTapped) {
                    console.log('Received in background');
                } else {
                    console.log('Received in foreground');
                    this.presentToast();
                    let youralert = this.alertController.create({
                        title: 'Interst Received',

                        message: data.body,
                        buttons: [
                            {
                                text: 'Cancel',
                                role: 'cancel',
                                handler: () => {
                                    console.log('Cancel clicked');
                                }
                            },
                            {
                                text: 'Okay',
                                // you'll need to get the input data, so pass a parameter to the callback
                                handler: (data) => {
                                    // here's the value user has edited in the input
                                    console.log('Edited message', data.yourInputName);
                                    console.log('Okay clicked');
                                }
                            }
                        ]
                    });
                    youralert.present()
                    //  alert(data.title + '\n' + data.body)

                }
            });

            // // refresh the FCM token
            this.fcm.onTokenRefresh().subscribe(token => {
                console.log(token);
                let newToken = {
                    noToken: token
                };
                this.storage.getData('signedToken').subscribe(userID => {
                    if (userID) {
                        this.loggedInUser = userID;
                        this.db.updateNotificationToken(this.loggedInUser, newToken)
                    }
                });
            });

            let comeFrom = this.navParams.get('comeFrom') || null;
            if (typeof comeFrom !== null && comeFrom === "dontrefresh") return null
            this.wardrobe = [];
            this.storage.getData('signedToken').subscribe(userID => {
                if (userID) {
                    this.loggedInUser = userID;
                    console.log('WE ARE HERE!');
                }
                this.storage.getData('newFilters').subscribe(filters => {
                    if (filters) {
                        this.selectedFilters = filters;
                    }
                    this.loadCards();
                });
            });
        });
    }

    /*
     *
     * The function is called when a card was swiped
     *
     * Values of intention: 0 - card was disliked, 1 - card was liked
     *
     */
    onCardInteract(event, type) {
        if (this.isIntentionButtonsReady) {
            if (type === 'nope') {
                this.isIntentionButtonsReady = false;
                this.isRetriveButtonReady = false;
                (async () => {
                    let cover = <HTMLElement>document.querySelector('.cardCover');
                    cover.style.backgroundImage = 'url(assets/imgs/dislikefade.png)';
                    let elem = <HTMLElement>document.querySelector('.swipeCard');
                    elem.style.transform = 'translate(-500px, 0) rotate(-40deg)';

                    await this.delay(400);
                    this.retriveHelper = 0;
                    this.saveCardToStorage(false);
                    //this.checkArrayLength();
                })();
            } else if (type === 'like') {
                this.isIntentionButtonsReady = false;
                this.isRetriveButtonReady = false;
                (async () => {
                    let cover = <HTMLElement>document.querySelector('.cardCover');
                    cover.style.backgroundImage = 'url(assets/imgs/likefade.png)';
                    let elem = <HTMLElement>document.querySelector('.swipeCard');
                    elem.style.transform = 'translate(500px, 0) rotate(40deg)';

                    this.badgeNumber++;
                    this.animationController = true;

                    await this.delay(400);
                    this.retriveHelper = 0;
                    this.saveCardToStorage(true);

                    await this.delay(400);

                    this.animationController = false;
                    //this.checkArrayLength();
                })();
            }

            if (type === 'swipe') {
                (async () => {
                    this.isRetriveButtonReady = false;
                    this.saveCardToStorage(event.like);
                    this.retriveHelper = 0;
                    if (event.like) {
                        this.badgeNumber++;
                        this.animationController = true;
                    }
                    await this.delay(700);
                    this.animationController = false;
                })();
            }
        }
    }

    /*
     *
     * Function saves the last swiped (or liked/disliked by the buttons)
     * card into the storage. In every saved card the intention is also set,
     * the value of it: 1 - like, 0 - dislike
     *
     */
    saveCardToStorage(intention: boolean) {
        if (this.wardrobe) {
            this.latestSwipedCard = this.wardrobe.shift();
            console.log(
                'TCL: HomePage -> saveCardToStorage -> this.latestSwipedCard',
                this.latestSwipedCard
            );

            let newCardToBeSaved = {
                id: this.latestSwipedCard['id'],
                imgUrl: this.latestSwipedCard['cardImg'],
                description: this.latestSwipedCard['description'],
                title: this.latestSwipedCard['title'],
                price: this.latestSwipedCard['price'],
                uploader: this.latestSwipedCard['uploader'],
                intention: 1,
                status: 0
            };

            if (!intention) {
                newCardToBeSaved.intention = 0;
            }

            this.storage.getData('swipedCards').subscribe(existingItems => {
                if (!existingItems) {
                    existingItems = [];
                    existingItems.push(newCardToBeSaved);
                    this.storage.setData('swipedCards', existingItems).subscribe(info => {
                        if (intention) this.increaseWhislistsNumber(newCardToBeSaved.id);
                        this.loadCards();
                    });
                } else {
                    let isLatestSwipedCardAlreadyExist = false;
                    existingItems.map(item => {
                        if (item.id === this.latestSwipedCard.id) {
                            isLatestSwipedCardAlreadyExist = true;
                            item.intention = newCardToBeSaved.intention;
                        }
                    });

                    if (isLatestSwipedCardAlreadyExist) {
                        this.storage
                            .setData('swipedCards', existingItems)
                            .subscribe(info => {
                                if (intention)
                                    this.increaseWhislistsNumber(newCardToBeSaved.id);
                                this.loadCards();
                            });
                    } else {
                        existingItems.push(newCardToBeSaved);
                        this.storage
                            .setData('swipedCards', existingItems)
                            .subscribe(info => {
                                if (intention)
                                    this.increaseWhislistsNumber(newCardToBeSaved.id);
                                this.loadCards();
                            });
                    }
                }
            });
        }
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

    // Check the length of the array in order to set the availability of the Like/Dislike buttons
    checkArrayLength() {
        if (this.wardrobe.length == 0) {
            this.isEnabled = false;
        }
    }

    // Set some delay for a swipe motion by button
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    checkforsize(item: any) {
        let isChecked = false;

        let type = item.size.type;

        if (type == 'cSize') {
            let letterList: Array<any> = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
            let AfterSearchLetterList: Array<any> = [];
            if (this.selectedFilters['size']['cSize'].length === 0) {
                isChecked = true;
            } else if (this.selectedFilters['size']['cSize'] !== 0) {
                this.selectedFilters['size']['cSize'].forEach(number => {
                    AfterSearchLetterList.push(letterList[number - 1]);
                });
            }

            AfterSearchLetterList.forEach(size => {
                if (size === item['size']['cSize']) {
                    console.log(item);
                    isChecked = true;
                }
            });
        }
        if (type == 'sSize') {
            if (this.selectedFilters['size']['sSize'].length === 0) {
                return true;
            } else {
                this.selectedFilters['size']['sSize'].forEach(size => {
                    if (size === item['size']['sSize']) {
                        isChecked = true;
                    }
                });
            }
        }
        if (type == 'kSize') {
            if (this.selectedFilters['size']['kSize'].length === 0) {
                isChecked = true;
            } else {
                this.selectedFilters['size']['kSize'].forEach(size => {
                    if (size === item['size']['kSize']) {
                        isChecked = true;
                    }
                });
            }
        }
        return isChecked;
    }

    filterItems(itemsToFilter: any) {
        let tempItems: Array<any> = [];
        let filterKeys = Object.keys(this.selectedFilters);
        itemsToFilter.map(item => {
            let filtersAreValid = {};
            filterKeys.map(key => {
                if (key == 'size') {
                    let sizeKeys = Object.keys(this.selectedFilters[key]);
                    if (sizeKeys.length === 0) {
                        return (filtersAreValid[key] = true);
                    }

                    let isSizeValid = {};

                    sizeKeys.map(sizeKey => {
                        if (
                            typeof item[key] === 'undefined' ||
                            typeof item[key].type === 'undefined' ||
                            typeof item[key].value === 'undefined'
                        )
                            return (isSizeValid[sizeKey] = true);

                        if (this.selectedFilters[key][sizeKey].length === 0)
                            return (isSizeValid[sizeKey] = true);
                        if (sizeKey !== item[key].type)
                            return (isSizeValid[sizeKey] = true);
                        if (
                            this.selectedFilters[key][sizeKey].indexOf(
                                parseInt(item[key].value)
                            ) > -1
                        )
                            return (isSizeValid[sizeKey] = true);
                        return (isSizeValid[sizeKey] = false);
                    });

                    let sizeHasFalseValue: boolean = false;
                    Object.keys(isSizeValid).map(k => {
                        if (isSizeValid[k] === false) sizeHasFalseValue = true;
                        return false;
                    });

                    if (!sizeHasFalseValue) return (filtersAreValid[key] = true);
                    return (filtersAreValid[key] = false);
                } else if (key === 'price') {
                    if (
                        this.selectedFilters[key].min[0] > 0 &&
                        this.selectedFilters[key].max[0] > 0 &&
                        (typeof item[key] === 'undefined' || item[key] === 0)
                    )
                        return (filtersAreValid[key] = false);

                    if (
                        this.selectedFilters[key].min.length === 0 &&
                        this.selectedFilters[key].max.length === 0
                    )
                        return (filtersAreValid[key] = true);
                    if (typeof item[key] === 'undefined' || item[key] === 0)
                        return (filtersAreValid[key] = true);
                    if (
                        (this.selectedFilters[key].min.length === 0 &&
                            this.selectedFilters[key].max.length !== 0) ||
                        (this.selectedFilters[key].min.length !== 0 &&
                            this.selectedFilters[key].max.length === 0)
                    )
                        return (filtersAreValid[key] = false);

                    if (
                        parseFloat(item[key]) >=
                        parseFloat(this.selectedFilters[key].min) &&
                        parseFloat(item[key]) <= parseFloat(this.selectedFilters[key].max)
                    ) {
                        return (filtersAreValid[key] = true);
                    } else if (
                        parseFloat(item[key]) > parseFloat(this.selectedFilters[key].max) &&
                        parseFloat(this.selectedFilters[key].max) === 10000
                    ) {
                        return (filtersAreValid[key] = true);
                    } else {
                        return (filtersAreValid[key] = false);
                    }
                } else {
                    if (
                        this.selectedFilters[key].length > 0 &&
                        typeof item[key] === 'undefined'
                    )
                        return (filtersAreValid[key] = false);
                    if (typeof item[key] === 'undefined')
                        return (filtersAreValid[key] = true);
                    if (this.selectedFilters[key].length === 0)
                        return (filtersAreValid[key] = true);

                    let isIn = false;

                    this.selectedFilters[key].forEach(brand => {
                        if (item[key][0] === brand) {
                            item[key].map(property => {
                                if (
                                    this.selectedFilters[key].indexOf(property.toLowerCase()) > -1
                                )
                                    return (isIn = true);
                            });
                        }
                    });

                    if (isIn) return (filtersAreValid[key] = true);
                    return (filtersAreValid[key] = false);
                }
            });

            let hasFalseValue: boolean = false;
            Object.keys(filtersAreValid).map(key => {
                if (filtersAreValid[key] === false) hasFalseValue = true;
                return false;
            });
            if (this.checkforsize(item)) {
                if (!hasFalseValue) {
                    tempItems.push(item);
                }
            }
        });

        return tempItems;
    }

    /*
     *
     * The function loads new cards from the database
     */
    loadCards() {
        if (!this.wardrobe || this.wardrobe.length > 1) {
            return;
        }
        this.db.getClothingFromDataBase().subscribe(clothesFromDb => {
            if (!clothesFromDb) {
                return; //Error, there is no cards in database
            }
            //only thoseproducts can go further which are available
            console.log('clothesFromDb', clothesFromDb);
            clothesFromDb = clothesFromDb.filter(cloth => {
                if (typeof cloth.status === 'undefined') return false;
                if (cloth.uploader.uid == this.loggedInUser) return false;
                if (cloth.block) {
                    let currentDate = new Date();
                    let diffMs = currentDate.valueOf() - cloth.block.blocktime.valueOf();
                    let diffMin = parseFloat((diffMs / 1000 / 60).toFixed(2));

                    if (diffMin < this.globalP.cartReservedTime) {
                        return false;
                    }
                }

                return cloth.status === 'available';
            });

            let filteredItems: Array<any> = [];
            let newItems: Array<any> = [];

            if (Object.keys(this.selectedFilters).length > 0) {
                filteredItems = this.filterItems(clothesFromDb);
            } else {
                filteredItems = clothesFromDb;
            }

            //////////////////////////////////////////

            if (filteredItems.length > 0) {
                this.storage.getData('swipedCards').subscribe(storageItems => {
                    if (storageItems) {
                        let ids: Array<string> = [];
                        storageItems.map(item => {
                            if (item && item.id) {
                                ids.push(item.id);
                            }
                        });

                        if (ids.length > 0) {
                            newItems = filteredItems.filter(item => {
                                if (item && item.id && ids.indexOf(item.id) < 0) {
                                    if (this.wardrobe && this.wardrobe.length > 0) {
                                        if (this.wardrobe[0].id != item.id) {
                                            return item;
                                        }
                                    } else {
                                        return item;
                                    }
                                }
                            });
                        } else {
                            newItems = filteredItems;
                        }
                    } else {
                        newItems = filteredItems;
                    }

                    if (newItems.length > 0) {
                        if (newItems.length === 1) {
                            this.setCardImgUrl(
                                1,
                                newItems[0].img && newItems[0].img[0]
                                    ? newItems[0].img[0]
                                    : 'empty-image.png'
                            ).subscribe(url => {
                                this.wardrobe.push({
                                    likeEvent: new EventEmitter(),
                                    destroyEvent: new EventEmitter(),
                                    id: newItems[0].id,
                                    description: newItems[0].desc,
                                    title: newItems[0].title,
                                    price: newItems[0].price,
                                    wishlists: newItems[0].whislists,
                                    uploader: newItems[0].uploader.uid,
                                    uploadDate: newItems[0].uploadDate,
                                    cardImg: 'url(' + url + ')',
                                    uploaderName: newItems[0].uploader.name
                                });
                            });
                        } else {
                            let firstCard: number;
                            if (!this.latestSwipedCard) {
                                firstCard = this.getRandomInt(newItems.length);

                                this.setCardImgUrl(
                                    0,
                                    newItems[firstCard].img && newItems[firstCard].img[0]
                                        ? newItems[firstCard].img[0]
                                        : 'empty-image.png'
                                ).subscribe(url => {
                                    this.wardrobe.push({
                                        likeEvent: new EventEmitter(),
                                        destroyEvent: new EventEmitter(),
                                        id: newItems[firstCard].id,
                                        description: newItems[firstCard].desc,
                                        title: newItems[firstCard].title,
                                        price: newItems[firstCard].price,
                                        wishlists: newItems[firstCard].whislists,
                                        uploader: newItems[firstCard].uploader.uid,
                                        uploadDate: newItems[firstCard].uploadDate,
                                        cardImg: 'url(' + url + ')',
                                        uploaderName: newItems[firstCard].uploader.name
                                    });
                                });
                            }

                            let secondCard: number;

                            let equal: boolean = false;
                            do {
                                secondCard = this.getRandomInt(newItems.length);
                                if (secondCard === firstCard) {
                                    equal = true;
                                } else {
                                    equal = false;
                                }
                            } while (equal);

                            this.setCardImgUrl(
                                1,
                                newItems[secondCard].img && newItems[secondCard].img[0]
                                    ? newItems[secondCard].img[0]
                                    : 'empty-image.png'
                            ).subscribe(url => {
                                this.wardrobe.push({
                                    likeEvent: new EventEmitter(),
                                    destroyEvent: new EventEmitter(),
                                    id: newItems[secondCard].id,
                                    description: newItems[secondCard].desc,
                                    title: newItems[secondCard].title,
                                    price: newItems[secondCard].price,
                                    wishlists: newItems[secondCard].whislists,
                                    uploader: newItems[secondCard].uploader.uid,
                                    cardImg: 'url(' + url + ')',
                                    uploaderName: newItems[secondCard].uploader.name
                                });
                                this.isIntentionButtonsReady = true;
                                this.isRetriveButtonReady = true;
                            });
                        }
                    } else {
                        if (this.wardrobe.length === 0) {
                            this.ready = false;
                        }
                    }
                });
            } else {
                if (this.wardrobe.length === 0) {
                    this.ready = false;
                }
            }
        });
    }

    setCardImgUrl(position: number, imageName: string): Observable<string> {
        return Observable.create(observ => {
            this.imageService.getImageURL(imageName).then(url => {
                observ.next(url);
                this.ready = true;
                observ.complete();
            });
        });
    }

    /*
     * The function retrieves the last swiped card, it will
     * be displayed as top card and removed from the storage
     */
    retriveLastStoredCard() {
        if (this.isRetriveButtonReady && !this.swipedCardsEmpty) {
            this.isRetriveButtonReady = false;
            this.storage.getData('swipedCards').subscribe(savedItems => {
                if (savedItems.length - 1 - this.retriveHelper === 1) {
                    this.swipedCardsEmpty === true;
                }

                if (savedItems) {
                    let previousItem =
                        savedItems[savedItems.length - 1 - this.retriveHelper];
                    this.wardrobe[0] = {
                        likeEvent: new EventEmitter(),
                        destroyEvent: new EventEmitter(),
                        id: previousItem.id,
                        description: previousItem.desc,
                        title: previousItem.title,
                        price: previousItem.price,
                        uploader: previousItem.uploader,
                        cardImg: previousItem.imgUrl
                    };

                    this.retriveHelper++;
                    this.isRetriveButtonReady = true;
                    this.ready = true;
                } else {
                    this.isRetriveButtonReady = true;
                }
            });
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    ionViewDidLeave() {
        this.badgeNumber = 0;
    }

    openRegistrationPage() {
        this.navCtrl.push(LoginPage);
    }


    async presentAlert() {
        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            title: "x has interest",

            buttons: ['OK']
        });

        await alert.present();
    }


    openMarketplacePage() {
        this.presentAlert();
        //  this.navCtrl.push(MarketplacePage);
    }

    openFilterPage() {
        this.latestSwipedCard = '';
        this.wardrobe = [];
        this.navCtrl.push(FilterPage);
    }

    openProductPage(clothId, page) {
        this.navCtrl.push(ProductPage, {itemId: clothId, startingPoint: page});
    }

    isNewItem(cloth) {
        const IS_NEWITEM_INTERVAL = 3;
        const ISODateString: string = cloth.uploadDate;
        const date = Date.parse(ISODateString);
        if (date === NaN) {
            return false;
        }
        const currentDate = new Date();
        const latestNewItemDate = currentDate.setDate(
            currentDate.getDate() - IS_NEWITEM_INTERVAL
        );
        return latestNewItemDate < date;
    }

    //   switchToAdminView(){
    //     new Promise(resolve => setTimeout(()=>resolve(), 1000)).then(()=>console.log("fired"));
    //     this.navCtrl.setRoot(AdminhomePage)
    // }


    // Notifications
    subscribeToTopic() {
        this.fcm.subscribeToTopic('enappd');
    }

    getToken() {
        this.fcm.getToken().then(token => {
            // Register your new token in your back-end if you want
            // backend.registerToken(token);
            let text: string = token;
            alert(text);
        });
    }

    unsubscribeFromTopic() {
        this.fcm.unsubscribeFromTopic('enappd');
    }

}
