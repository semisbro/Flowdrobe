import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    AlertController,
    Platform,
    Item
} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {DatabaseProvider} from '../../providers/database/database';
import {SelectpaymentPage} from '../selectpayment/selectpayment';
import {GlobalProvider} from '../../providers/global/global';
import {ProductPage} from '../product/product';
import {LoginPage} from '../login/login';
import {HomePage} from '../home/home';
import {UploadpicturePage} from '../uploadpicture/uploadpicture';
import {PickupChosserPage} from '../pickup-chosser/pickup-chosser';
import {ImageService} from '../../services/image-Service';

const uuid = require('uuid');

@IonicPage()
@Component({
    selector: 'page-marketplace',
    templateUrl: 'marketplace.html'
})
export class MarketplacePage {
    likedItems: Array<string> = [];
    cartItems: Array<string> = [];
    cartItemsCount: number = 0;
    cartItemsTotal: number = 0;
    marketpage: string = 'wishlist';
    articleIds: Array<string> = [];
    sellerIds: Array<string> = [];
    offer: any;
    availableClothes: Array<any> = [];

    offerClothesBuyer: Array<any> = [];
    offerClothesSeller: Array<any> = [];

    offerAcceptedClothesBuyer: Array<any> = [];
    offerAcceptedClothesSeller: Array<any> = [];

    offerDeniedClothesBuyer: Array<any> = [];

    searchedClothes: Array<any> = [];

    cardImg: string = '';

    userId: any;
    isSuperFlowster: boolean = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storage: StorageProvider,
        public alertCtrl: AlertController,
        public db: DatabaseProvider,
        public globalP: GlobalProvider,
        private platform: Platform,
        private imageService: ImageService
    ) {

    }

    checkIfItemExists(cards) {
        console.log("kártyaa", cards)
        if (!cards || typeof cards === null) return
        cards.forEach(element => {
            this.db.getSpecificClothFromDataBase(element.id).subscribe(res => {
                if (res.length > 0) {
                    const status = res[0].status;
                    if (status !== 'available') {
                        this.removeFromWishlist(element);
                    } else {
                    }
                }
            });
        });
    }

    ionViewWillEnter() {

        if (typeof this.navParams.get('tab') !== 'undefined') {
            this.marketpage = this.navParams.get('tab');
        } else {
            this.marketpage = 'wishlist';
        }
        this.platform.ready().then(ready => {
            this.storage.getData('swipedCards').subscribe(cards => {
                this.checkIfItemExists(cards);
                if (cards) {
                    this.likedItems = cards.filter(card => {
                        return card.intention === 1;
                    });
                    this.likedItems.reverse();
                } else {
                    this.likedItems = [];
                }
            });
        });


        this.storage.getData('signedToken').subscribe(userID => {
            if (!userID) {
                return;
            } else {
                this.storage.getData('cartItems').subscribe(cartItems => {
                    if (cartItems && cartItems.length > 0) {
                        this.setUser(cartItems);
                    }
                });
                this.db.getUserFromDataBase(userID).subscribe(user => {
                    if (typeof user === null) {
                        return
                    } else {
                        this.userId = userID;
                        if (this.navParams.get('isWishlistLoginAttempt')) {
                            const card = this.navParams.get('card');
                            if (card['uploader'].toString() === userID.toString()) {
                                this.alertCtrl
                                    .create({
                                        title: 'Woops..!',
                                        subTitle:
                                            'You are trying to add your own product to your cart. Removing it from your wishlist :)',
                                        buttons: [
                                            {
                                                text: 'Ok',
                                                handler: () => {
                                                    this.removeFromWishlist(card);
                                                }
                                            }
                                        ]
                                    })
                                    .present();
                            } else {
                                this.takeToCart(card);
                            }
                        }
                        this.isSuperFlowster = user.isSuperFlowster.valueOf();
                        this.loadClothes();
                    }
                });
            }
        });
    }

    loadClothes() {
        this.loadAvailableClothes();
        this.loadDeniedOfferBuyerClothes();
        this.loadOfferAcceptedBuyerClothes();
        this.loadOfferAcceptedSellerClothes();
        this.loadOfferBuyerClothes();
        this.loadOfferSellerClothes();
    }

    loadAvailableClothes() {
        // Available
        this.db
            .getAdminClothesFromDataBase(this.userId, 'available')
            .subscribe(avClothes => {
                this.availableClothes = avClothes;

                this.availableClothes.map(item => {
                    if (item && item.img && item.img[0]) {
                        this.imageService.getImageURL(item.img[0]).then(url => {
                            item.cardImg = 'url(' + url + ')';
                        });
                    }
                });
            });
        this.availableClothes.sort(function (a, b) {
            if (a.uploadDate < b.uploadDate) {
                return -1;
            }
            if (a.uploadDate > b.uploadDate) {
                return 1;
            }
            return 0;
        });
    }

    loadOfferSellerClothes() {
        this.db
            .getAdminClothesFromDataBase(this.userId, 'offer')
            .subscribe(offerClothes => {
                this.offerClothesSeller = offerClothes;

                this.offerClothesSeller.map(item => {
                    if (item && item.img && item.img[0]) {
                        this.imageService.getImageURL(item.img[0]).then(url => {
                            item.cardImg = 'url(' + url + ')';
                        });
                    }
                });
            });
    }

    loadOfferBuyerClothes() {
        this.db
            .getBoughtClothesFromDataBase(this.userId, 'offer')
            .subscribe(offerClothes => {
                this.offerClothesBuyer = offerClothes;

                this.offerClothesBuyer.map(item => {
                    if (item && item.img && item.img[0]) {
                        this.imageService.getImageURL(item.img[0]).then(url => {
                            item.cardImg = 'url(' + url + ')';
                        });
                    }
                });
            });
    }

    loadOfferAcceptedSellerClothes() {
        this.db
            .getAdminClothesFromDataBase(this.userId, 'accepted')
            .subscribe(accepted => {
                this.offerAcceptedClothesSeller = accepted;

                this.offerAcceptedClothesSeller.map(item => {
                    if (item && item.img && item.img[0]) {
                        this.imageService.getImageURL(item.img[0]).then(url => {
                            item.cardImg = 'url(' + url + ')';
                        });
                    }
                });
            });
    }

    loadOfferAcceptedBuyerClothes() {
        this.db
            .getBoughtClothesFromDataBase(this.userId, 'accepted')
            .subscribe(accepted => {
                this.offerAcceptedClothesBuyer = accepted;

                this.offerAcceptedClothesBuyer.map(item => {
                    if (item && item.img && item.img[0]) {
                        this.imageService.getImageURL(item.img[0]).then(url => {
                            item.cardImg = 'url(' + url + ')';
                        });
                    }
                });
            });
    }

    loadDeniedOfferBuyerClothes() {
        this.db
            .getBoughtClothesFromDataBase(this.userId, 'deniedOffer')
            .subscribe(accepted => {
                this.offerDeniedClothesBuyer = accepted;
                this.offerDeniedClothesBuyer.map(item => {
                    if (item && item.img && item.img[0]) {
                        this.imageService.getImageURL(item.img[0]).then(url => {
                            item.cardImg = 'url(' + url + ')';
                        });
                    }
                });
            });
    }

    setUser = async cartItems => {
        return await Promise.all(
            cartItems.map(item => this.setUserOnItem(item))
        ).then(res => {
            this.transformCartItems(res);
        });
    };

    setUserOnItem = async item => {
        return await this.addUsersToCartItems(item);
    };

    transform(collection: Array<any>, property: string): Array<any> {
        if (!collection) {
            return null;
        }

        const groupedCollection = collection.reduce((previous, current) => {
            if (!previous[current[property]]) {
                previous[current[property]] = [current];
            } else {
                previous[current[property]].push(current);
            }

            return previous;
        }, {});

        return Object.keys(groupedCollection).map(key => ({
            key,
            value: groupedCollection[key]
        }));
    }

    fetchWishList() {
    }

    transformCartItems(cartItems) {
        this.cartItemsTotal = 0;
        this.cartItems = this.transform(cartItems, 'user');
        let cartItemsCount = 0;
        this.cartItems.map(cartItem => {
            if (cartItem && cartItem['value']) {
                cartItemsCount += cartItem['value'].length;
                cartItem['value'].map(cartItemValue => {
                    if (cartItemValue && cartItemValue.price) {
                        this.cartItemsTotal += parseFloat(cartItemValue.price);
                    }
                });
            }
        });
        this.cartItemsCount = cartItemsCount;
    }

    transformClothes = async item => {
        return await Promise.all(item.map(item => this.transformCartItems(item)));
    };

    trasformClothItem(item): Array<any> {
        let itemToReturn: Array<any> = [];
        this.cartItems.map(cItem => {
            if (cItem && cItem['value']) {
                itemToReturn.push(cItem);
                cItem['value'].map(cartItemValue => {
                    if (cartItemValue) {
                        itemToReturn['value'] = cartItemValue;
                    }
                });
            }
        });
        return itemToReturn;
    }

    async addUsersToCartItems(cartItem) {
        return new Promise((resolve, reject) => {
            if (cartItem && cartItem.uploader) {
                this.storage.getData('signedToken').subscribe(token => {
                    if (!token) resolve(null);
                    this.db.getUserFromDataBase(token).subscribe(buyer => {
                        cartItem['buyer'] = buyer;
                        if (cartItem.uploader.uid) {
                            this.db
                                .getUserFromDataBase(cartItem.uploader.uid)
                                .subscribe(seller => {
                                    cartItem['seller'] = seller;
                                    resolve(cartItem);
                                });
                        } else {
                            this.db
                                .getUserFromDataBase(cartItem.uploader)
                                .subscribe(seller => {
                                    cartItem['seller'] = seller;
                                    resolve(cartItem);
                                });
                        }
                    });
                });
            }
        });
    }

    removeFromWishlistAlert(selectedItem) {
        const confirm = this.alertCtrl.create({
            title: 'Are you sure you want to delete this item?',
            message:
                "This item will be deleted immediately from your wishlist. You can't undo this action.",
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                    }
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.removeFromWishlist(selectedItem);
                    }
                }
            ]
        });
        confirm.present();
    }

    removeFromWishlist(selectedItem) {
        if (selectedItem && selectedItem.id) {
            this.storage.getData('swipedCards').subscribe(swipedCards => {
                if (swipedCards) {
                    swipedCards.map(sCard => {
                        if (sCard && sCard.id) {
                            if (sCard.id === selectedItem.id) {
                                sCard.intention = 0;
                            }
                        }
                    });
                    this.storage
                        .setData('swipedCards', swipedCards)
                        .subscribe(info => {
                        });
                }
            });
            if (this.likedItems) {
                this.likedItems.map((lItem, index) => {
                    if (lItem && lItem['id']) {
                        if (lItem['id'] === selectedItem.id) {
                            this.likedItems.splice(index, 1);
                        }
                    }
                });
            }
        }
    }

    removeFromCart(selectedKey, selectedValueItemId) {
        const confirm = this.alertCtrl.create({
            title: 'Are you sure you want to remove this item?',
            message:
                'This item will be removed from your cart and will be returned to the wishlist.',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                    }
                },
                {
                    text: 'Remove',
                    handler: () => {
                        if (selectedKey && selectedValueItemId) {
                            this.storage.getData('cartItems').subscribe(cartItems => {
                                if (cartItems) {
                                    cartItems.map((cartItem, index) => {
                                        if (cartItem && cartItem.id) {
                                            if (cartItem.id === selectedValueItemId) {
                                                cartItems.splice(index, 1);
                                                this.loadAvailableClothes();
                                            }
                                        }
                                    });
                                    this.storage
                                        .setData('cartItems', cartItems)
                                        .subscribe(info => {
                                            this.loadAvailableClothes();
                                        });
                                }
                            });
                            if (this.cartItems) {
                                this.cartItems.map((cartItem, cartItemIndex) => {
                                    if (cartItem && cartItem['key'] && cartItem['value']) {
                                        if (cartItem['key'] === selectedKey) {
                                            cartItem['value'].map(
                                                (cartItemValueItem, cartItemValueItemIndex) => {
                                                    if (cartItemValueItem && cartItemValueItem.id) {
                                                        if (cartItemValueItem.id === selectedValueItemId) {
                                                            this.cartItemsCount--;
                                                            if (cartItemValueItem.price) {
                                                                this.cartItemsTotal -= cartItemValueItem.price;
                                                            }
                                                            cartItem['value'].splice(
                                                                cartItemValueItemIndex,
                                                                1
                                                            );
                                                            if (cartItem['value'].length === 0) {
                                                                this.cartItems.splice(cartItemIndex, 1);
                                                                this.loadAvailableClothes();
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                });
                            }
                            this.storage.getData('swipedCards').subscribe(swipedCards => {
                                if (swipedCards) {
                                    swipedCards.map(swipedCard => {
                                        if (swipedCard && swipedCard.id) {
                                            if (swipedCard.id === selectedValueItemId) {
                                                this.loadAvailableClothes();
                                                swipedCard.intention = 1;
                                            }
                                        }
                                    });
                                    this.storage
                                        .setData('swipedCards', swipedCards)
                                        .subscribe(newSwipedCards => {
                                            if (newSwipedCards) {
                                                this.likedItems = newSwipedCards.filter(card => {
                                                    if (card && card.intention) {
                                                        return card.intention === 1;
                                                        this.loadAvailableClothes();
                                                    }
                                                });
                                                this.likedItems.reverse();
                                            } else {
                                                this.likedItems = [];
                                            }
                                        });
                                }
                            });
                        }
                    }
                }
            ]
        });
        confirm.present();
    }

    takeToCart(card) {
        this.storage.getData('signedToken').subscribe(sub => {
            if (!sub) {
                this.navCtrl.push(LoginPage, {
                    card: card,
                    isWishlistLoginAttempt: true
                });
            } else {
                if (card.uploader.toString() === this.userId.toString()) {
                    const confirm = this.alertCtrl.create({
                        title: 'You can\t trade on own items ',
                        message:
                            "This item will be deleted immediately from your wishlist.",
                        buttons: [
                            {
                                text: 'Ok',
                                handler: () => {
                                }
                            }
                        ]
                    });
                    confirm.present();
                    this.removeFromWishlist(card);
                    return;
                }
                this.takeToCartLogic(card);
            }
        });
    }

    takeToCartLogic(card) {
        if (card && card.id) {
            this.storage.getData('swipedCards').subscribe(swipedCards => {
                if (swipedCards) {
                    swipedCards.map(sCard => {
                        if (sCard && sCard.id) {
                            if (sCard.id === card.id) {
                                sCard.intention = 0;
                            }
                        }
                    });
                    this.storage
                        .setData('swipedCards', swipedCards)
                        .subscribe(info => {
                        });
                }
            });
            this.storage.getData('cartItems').subscribe(cartItems => {
                if (!cartItems) {
                    cartItems = [];
                }
                if (this.cardImg !== '') {
                    card['imgUrl'] = this.cardImg;
                    this.cardImg = '';
                }
                cartItems.push(card);
                this.blockRefresh(card, this.userId);
                this.storage.setData('cartItems', cartItems).subscribe(newCartItems => {
                    if (newCartItems && newCartItems.length === 1) {
                        this.setUser(newCartItems);
                    } else if (newCartItems && newCartItems.length > 1) {
                        //newCartItems.forEach((element, index) => {
                        this.setUser(newCartItems);
                        //})
                    }
                });
            });
            if (this.likedItems) {
                this.likedItems.map((lItem, index) => {
                    if (lItem && lItem['id']) {
                        if (lItem['id'] === card.id) {
                            this.likedItems.splice(index, 1);
                        }
                    }
                });
            }
            this.cartItemsCount++;
        }
    }

    blockRefresh(item, uid) {
        this.db.getDocIDFromDataBase(item.id).subscribe(docId => {
            if (docId) {
                let currentDate = new Date();
                this.db.setBlock(docId[0], currentDate, uid);
            }
        });
    }

    makeOfferAlert(cItem, tabString, key?) {
        console.log("offer", cItem)
        let name = ''

        if (!cItem.seller)
            cItem.seller = cItem.uploader;

        if (typeof cItem.seller !== null) {
            if (typeof cItem.seller.name !== null) name = cItem.seller.name
        }
        let alert = this.alertCtrl.create({
            title: 'Pay the price or risk negotiating!',
            message: name + ' will contact you for wished payment and shipping method.',
            cssClass: 'offerAlert',
            inputs: [
                {
                    name: 'offer',
                    type: 'number',
                    placeholder: cItem.price
                }
            ],
            buttons: [
                {
                    cssClass: 'alert-secondary',
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                    }
                },
                {
                    cssClass: 'alert-primary',
                    text: 'Show interest',
                    handler: data => {
                        if (data.offer > 0) {
                            this.offer = data.offer;
                        }
                        if (tabString === 'cart') {
                            this.makeOffer(cItem, tabString, key);
                        } else {
                            this.makeOffer(cItem, tabString);
                        }
                    }
                }
            ]
        });
        alert.present();
    }

    makeOffer(cItem, tabString, key?) {
        const alert = this.alertCtrl.create({
            subTitle: `Are you sure?`,
            buttons: [
                {
                    cssClass: 'alert-secondary',
                    text: 'Cancel',
                    handler: () => {
                        return;
                    }
                },
                {
                    cssClass: 'alert-primary',
                    text: 'OK',
                    handler: () => {
                        const ref = uuid();
                        const currentDate = new Date();

                        this.db.getSpecificClothFromDataBase(cItem.id).subscribe(cloth => {
                            if (!cloth) return;
                            let clothFromDb: Array<any> = [];

                            cloth.map(cItem => {
                                if (cItem && cItem.id) {
                                    clothFromDb.push(cItem);
                                }
                            });

                            this.storage.getData('signedToken').subscribe(uid => {
                                if (!uid) return this.navCtrl.push(LoginPage);

                                let confirmedItem: boolean;
                                let confirmedCloth: any;
                                let deniedItem: any;

                                if (!clothFromDb) return;

                                if (
                                    clothFromDb[0]['status'] !== 'available' &&
                                    clothFromDb[0]['status'] !== 'deniedOffer'
                                ) {
                                    //1-N
                                    deniedItem = clothFromDb;
                                } else {
                                    //1-Y


                                    if (typeof clothFromDb[0]['block'] === 'undefined') {
                                        confirmedItem = true;
                                        confirmedCloth = clothFromDb;
                                    } else {
                                        let currentDate = new Date();
                                        let diffMs =
                                            currentDate.valueOf() -
                                            clothFromDb[0]['block']['blocktime'].valueOf();
                                        let diffMin = parseFloat((diffMs / 1000 / 60).toFixed(2));
                                        //2-Y
                                        if (
                                            typeof clothFromDb[0]['block']['blocktime'] ===
                                            'undefined' ||
                                            typeof clothFromDb[0]['block']['user'] === 'undefined'
                                        ) {
                                            confirmedCloth = clothFromDb;
                                            confirmedItem = true;
                                        } else {
                                            if (diffMin > this.globalP.cartReservedTime) {
                                                //3-N
                                                confirmedCloth = clothFromDb;
                                                confirmedItem = true;
                                            } else {
                                                //3-Y

                                                if (uid !== clothFromDb[0]['block']['user']) {
                                                    //4-N
                                                    deniedItem = clothFromDb;
                                                } else {
                                                    //4-Y
                                                    confirmedCloth = clothFromDb;
                                                    confirmedItem = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (
                                    deniedItem === null ||
                                    (typeof deniedItem === 'undefined' && confirmedItem === true)
                                ) {
                                    this.db
                                        .getDocIDFromDataBase(clothFromDb[0]['id'])
                                        .subscribe(docId => {
                                            if (this.offer > 0) {
                                                if (cItem.buyer.buyerName) {
                                                    this.db.setBuyer(
                                                        docId,
                                                        ref,
                                                        currentDate,
                                                        uid,
                                                        this.offer,
                                                        cItem.buyer.buyerName,
                                                        cItem.buyer.buyerPhone,
                                                        cItem.buyer.buyerCity,
                                                        cItem.buyer.buyerPostalCode
                                                    );
                                                    this.db.updateClothStatus(docId, 'offer');

                                                } else {
                                                    this.db.setBuyer(
                                                        docId,
                                                        ref,
                                                        currentDate,
                                                        uid,
                                                        this.offer,
                                                        cItem.buyer.name,
                                                        cItem.buyer.phone,
                                                        cItem.buyer.city,
                                                        cItem.buyer.postalCode
                                                    );
                                                    this.db.updateClothStatus(docId, 'offer');
                                                }

                                                // SEND notification
                                                let title = 'Offer made by ' + cItem.buyer.name;
                                                let body = 'Offered: kr. ' + this.offer + ',- on ' + cItem.displayBrand;
                                                let token = cItem.seller.noToken;
                                                this.db.sendNotification(token,
                                                    title,
                                                    body
                                                );


                                            } else {
                                                if (cItem.buyer.buyerName) {
                                                    this.db.setBuyer(
                                                        docId,
                                                        ref,
                                                        currentDate,
                                                        uid,
                                                        cItem.price,
                                                        cItem.buyer.buyerName,
                                                        cItem.buyer.buyerPhone,
                                                        cItem.buyer.buyerCity,
                                                        cItem.buyer.buyerPostalCode
                                                    );
                                                    this.db.updateClothStatus(docId, 'offer');
                                                } else {
                                                    this.db.setBuyer(
                                                        docId,
                                                        ref,
                                                        currentDate,
                                                        uid,
                                                        cItem.price,
                                                        cItem.buyer.name,
                                                        cItem.buyer.phone,
                                                        cItem.buyer.city,
                                                        cItem.buyer.postalCode
                                                    );
                                                    this.db.updateClothStatus(docId, 'offer');
                                                }
                                            }
                                            this.removeItem(confirmedCloth, tabString);

                                            this.storage
                                                .setData('cartItems', this.cartItems)
                                                .subscribe(info => {
                                                    this.loadOfferBuyerClothes();
                                                    this.offer = 0;
                                                });
                                        });
                                } else {
                                    if (tabString === 'cart') {
                                        this.showAlert(deniedItem, tabString, key);
                                    } else {
                                        this.showAlert(deniedItem, tabString);
                                    }
                                }
                            });
                        });
                    }
                }
            ]
        });
        alert.present();

    }

    showAlert(deniedItems, tabString, key?) {
        const alert = this.alertCtrl.create({
            subTitle:
                'In the meantime, some of your favorite clothes have been sold. Please check your cart again.',
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        if (tabString === 'cart') {
                            this.removeFromCart(key, deniedItems);
                        } else {
                            this.removeItem(deniedItems, tabString);
                        }
                    }
                }
            ]
        });
        alert.present();
    }

    removeItem(item, tabString?) {
        if (tabString !== 'cart') {
            this.reject(item, tabString);
        } else {
            this.storage.getData('cartItems').subscribe(cItems => {
                if (!cItems) return;
                item.map(item => {
                    if (item && typeof item.id !== 'undefined') {
                        this.cartItemsCount--;
                        if (typeof item.price !== 'undefined') {
                            this.cartItemsTotal -= item.price;
                        }

                        cItems.map((cItem, cIndex) => {
                            if (
                                cItem &&
                                typeof cItem.id !== 'undefined' &&
                                item.id === cItem.id
                            ) {
                                cItems.splice(cIndex, 1);
                            }
                        });

                        this.cartItems.map((cartItem, cartItemIndex) => {
                            if (!cartItem || !cartItem['value']) return;

                            cartItem['value'].map((ciValueItem, ciValueItemIndex) => {
                                if (
                                    ciValueItem &&
                                    typeof ciValueItem.id !== 'undefined' &&
                                    ciValueItem.id === item.id
                                ) {
                                    cartItem['value'].splice(ciValueItemIndex, 1);
                                    if (cartItem['value'].length === 0) {
                                        this.cartItems.splice(cartItemIndex, 1);
                                    }
                                }
                            });
                        });
                    }
                });
                this.storage.setData('cartItems', cItems).subscribe(info => {
                    this.loadAvailableClothes();
                });
            });
        }
    }

    deleteItem(item) {
        const confirm = this.alertCtrl.create({
            title: 'Are you sure you want to delete this item?',
            message:
                'This item will be deleted immediately from the wardrobe. Users can no longeRr buy it.',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                    }
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.db.getDocIDFromDataBase(item).subscribe(res => {
                            this.db.updateClothStatus(res, 'deleted').then(res => {
                                this.loadAvailableClothes();
                            });
                        });
                    }
                }
            ]
        });
        confirm.present();
    }

    editItem(cItem) {
        this.db.getSpecificClothFromDataBase(cItem).subscribe(res => {
            this.navCtrl.push(UploadpicturePage, {cItem: res});
        });
    }

    confirmRequest(item: any) {
        const confirm = this.alertCtrl.create({
            title: 'Are you sure you want to confirm this request?',
            message:
                'Have you made sure that this product is available and can be sent to the customer?',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                    }
                },
                {
                    text: 'Confirm',
                    handler: () => {
                        this.db.getDocIDFromDataBase(item.id).subscribe(docid => {
                            this.db.updateClothStatus(docid, 'accepted').then(() => {
                                this.offerClothesSeller = this.offerClothesSeller.filter(
                                    reservedItem => {
                                        return reservedItem.id != item.id;
                                    }
                                );
                                this.loadOfferAcceptedSellerClothes();

                                // SEND notification
                                let title = `${item.uploader.name} accepted your offer!`;
                                let body = `Your offer was: kr. ${item.buyer.offer},- on ${item.displayBrand}`;
                                this.db.getNotificationToken(item.buyer.uid).then(result => {
                                    this.db.sendNotification(result.get('noToken'),
                                        title,
                                        body
                                    );
                                });
                            });
                        });
                    }
                }
            ]
        });
        confirm.present();
    }

    reject(item: any, tab: string, cartItem?: any) {
        let docItem = item;

        // this.db.getDocIDFromDataBase(notify).subscribe(() => {
        //   console.log('NOTI GOT CALLED!');
        // });


        /*
        if (tab === 'offerDeniedClothesBuyer') {
          docItem = item[0]['id'];
        }
        */


        this.db.getDocIDFromDataBase(docItem).subscribe(docid => {
            if (tab === 'offerClothesSeller') {
                this.db.updateClothStatus(docid, 'deniedOffer').then(() => {
                    this.offerClothesSeller = this.offerClothesSeller.filter(
                        reservedItem => {
                            return reservedItem.id != item;
                            this.loadAvailableClothes();
                        }
                    );
                });
            } else if (tab === 'offerClothesBuyer') {
                this.db.updateClothStatus(docid, 'available').then(() => {
                    this.cardImg = cartItem['cardImg'];
                    this.takeToCart(cartItem);
                    this.offerClothesBuyer = this.offerClothesBuyer.filter(
                        reservedItem => {
                            return reservedItem.id != item;
                            this.loadAvailableClothes();
                        }
                    );
                });
            } else if (tab === 'offerAcceptedClothesSeller') {
                this.db.updateClothStatus(docid, 'available').then(() => {
                    this.offerAcceptedClothesSeller = this.offerAcceptedClothesSeller.filter(
                        reservedItem => {
                            return reservedItem.id != item;
                            this.loadAvailableClothes();
                        }
                    );
                });
            } else if (tab === 'offerAcceptedClothesBuyer') {
                this.db.updateClothStatus(docid, 'offer').then(() => {
                    this.offerAcceptedClothesBuyer = this.offerAcceptedClothesBuyer.filter(
                        reservedItem => {
                            return reservedItem.id != item;
                            this.loadAvailableClothes();
                        }
                    );
                });
            } else if (tab === 'offerDeniedClothesBuyer') {
                this.db.updateClothStatus(docid, 'available').then(() => {
                    this.db.removeBlockTime(docid).then(() => {
                        this.offerDeniedClothesBuyer = this.offerDeniedClothesBuyer.filter(
                            reservedItem => {
                                this.loadAvailableClothes();
                                return reservedItem.id != docItem;
                            }
                        );
                    })
                });
            }
        });
    }

    rejectRequest(item: any, tab: string, cartItem?: any) {
        const confirm = this.alertCtrl.create({
            title: 'Are you sure you want to reject this request?',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        //DO NOTHING
                    }
                },
                {
                    text: 'Confirm',
                    handler: () => {
                        this.reject(item.id, tab, cartItem);

                        // SEND Notifications
                        if (tab === 'offerClothesSeller') {
                            let title = `${item.uploader.name} rejected your offer!`;
                            let body = `Your offer was: kr. ${item.buyer.offer},- on ${item.displayBrand}`;
                            this.db.getNotificationToken(item.buyer.uid).then(result => {
                                this.db.sendNotification(result.get('noToken'),
                                    title,
                                    body
                                );
                            });
                        } else if (tab === 'offerClothesBuyer') {
                            let title = `${item.buyer.name} canceled the offer!`;
                            let body = `The offer was: kr. ${item.buyer.offer},- on ${item.displayBrand}`;
                            this.db.getNotificationToken(item.uploader.uid).then(result => {
                                this.db.sendNotification(result.get('noToken'),
                                    title,
                                    body
                                );
                            });
                        } else if (tab === 'offerAcceptedClothesSeller') {
                            let title = `${item.uploader.name} canceled your offer!`;
                            let body = `Your offer was: kr. ${item.buyer.offer},- on ${item.displayBrand}`;
                            this.db.getNotificationToken(item.buyer.uid).then(result => {
                                this.db.sendNotification(result.get('noToken'),
                                    title,
                                    body
                                );
                            });
                        } else if (tab === 'offerAcceptedClothesBuyer') {
                            let title = `${item.buyer.name} canceled the trade!`;
                            let body = `The offer was: kr. ${item.buyer.offer},- on ${item.displayBrand}`;
                            this.db.getNotificationToken(item.uploader.uid).then(result => {
                                this.db.sendNotification(result.get('noToken'),
                                    title,
                                    body
                                );
                            });
                        } else if (tab === 'offerDeniedClothesBuyer') {
                            let title = `${item.buyer.name} OFFER DENIED!`;
                            let body = `The offer was: kr. ${item.buyer.offer},- on ${item.displayBrand}`;
                            this.db.getNotificationToken(item.uploader.uid).then(result => {
                                this.db.sendNotification(result.get('noToken'),
                                    title,
                                    body
                                );
                            });
                        }
                    }
                }
            ]
        });
        confirm.present();
    }

    payItem(articleId, sellerId, price, title) {
        // if(this.isSuperFlowster === true){
        //
        //   this.navCtrl.push(SelectpaymentPage, {articleId: articleId, sellerId: sellerId, total: price, title: title})
        // }
        // else {
        //
        // }

        return new Promise((resolve, reject) => {
            this.storage.getData('signedToken').subscribe(uid => {
                if (!uid) return this.navCtrl.push(LoginPage);
                this.db.getSpecificClothFromDataBase(articleId).subscribe(clothes => {
                    if (clothes) {
                        let isBuyOK = true;
                        if (!isBuyOK) {
                        } else {
                            let reference = uuid();
                            let currentDate = new Date();
                            this.db.getUserFromDataBase(uid).subscribe(user => {
                                clothes.map(item => {
                                    if (item && item.id) {
                                        this.db.getDocIDFromDataBase(item.id).subscribe(docId => {
                                            if (docId) {
                                                this.db
                                                    .updateClothStatus(docId[0], 'bought')
                                                    .then(info => {
                                                        this.offerAcceptedClothesBuyer = this.offerAcceptedClothesBuyer.filter(
                                                            reservedItem => {
                                                                return reservedItem.id != articleId;
                                                            }
                                                        );
                                                        //this.storage.removeData('cartItems').subscribe(() => {
                                                        return resolve(true);
                                                        //})
                                                    });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    }
                });
            });
        });
    }

    uploadNewProduct() {
        this.navCtrl.push(PickupChosserPage);
    }

    openProductPage(clothId, tabTitle) {
        this.navCtrl.push(ProductPage, {
            itemId: clothId,
            startingPoint: tabTitle
        });
    }

    openHomePage() {
        let comeFrom = this.navParams.get('comeFrom')
        if (comeFrom && comeFrom === 'reFresh') {
            this.navCtrl.setRoot(HomePage)
        } else {
            this.navCtrl.getPrevious().data.comeFrom = "dontrefresh"
            this.navCtrl.pop()
        }
    }

    goToPage(page: string) {

        if (page == 'wardrobe') {
            this.storage.getData('signedToken').subscribe(Token => {
                this.db.getUserFromDataBase(Token).subscribe(user => {
                    this.marketpage = page
                })
            })
        } else {
            this.marketpage = page;
        }

    }
}
