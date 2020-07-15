import { Component, forwardRef, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
//import { AdminhomePage } from "../adminhome/adminhome";
import { DatabaseProvider } from '../../providers/database/database';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageProvider } from '../../providers/storage/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { File } from '@ionic-native/file';
import * as firebase from 'firebase/app';
import { SearchPage } from '../search/search';
import { GlobalProvider } from '../../providers/global/global';
import { UploadconfirmationPage } from '../uploadconfirmation/uploadconfirmation';
import { LoginPage } from '../login/login';
import { MarketplacePage } from '../marketplace/marketplace';
import { HomePage } from '../home/home';

const uuid = require('uuid');

@IonicPage()
@Component({
  selector: 'page-selectcategory',
  templateUrl: 'selectcategory.html'
})
export class SelectcategoryPage implements OnInit {
  clicked = false;

  filtersFromDB: Array<any>;
  filterConditions: Array<any>;

  clothesSize: any;

  isEdit = false;

  conditionArray: Array<any> = [];

  photos: Array<any> = [];

  isNewBrand: any;

  hasSetBadge: boolean = false;

  shoeSizeValue: any;
  shoeSize: any;

  clothesSizeFilter: any;

  shoesRangeMin: any;
  shoesRangeMax: any;

  kidSizeValue: any;
  kidSize: any;
  kidHelper: any;

  distance: any;

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
    uploader: {
      uid: '',
      name: '',
      city: '',
      phone: '',
      postalCode: ''
    },
    uploadDate: new Date().toISOString()
  };

  colorController: any = {};

  showFooter = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: DatabaseProvider,
    private sanitizer: DomSanitizer,
    private storage: StorageProvider,
    private globalP: GlobalProvider,
    public http: HttpClient,
    private file: File
  ) {
    if (this.navParams.get('selectedDetails')) {
      this.selectedDetails = this.navParams.get('selectedDetails');
      this.filtersFromDB = this.navParams.get('DbFilters');
      this.upload();
    }

    this.shoesRangeMin = 16;
    this.shoesRangeMax = 47;

    this.getFiltersFromStorage();
  }

  ionViewWillEnter() {
    if (this.storage.getData('selectedDetails')) {
      this.storage.getData('selectedDetails').subscribe(selectedDetails => {
        if (selectedDetails) {
          console.log('Selected details exists!!!');
          //this.setBrand()
          this.setBrandDisplayName();
        }
      });
    } else {
      console.log('Selected details do not exist!!!');
      this.setBrand();
      this.setBrandDisplayName();
    }
  }

  ngOnInit() {
    if (this.navParams.get('cItem')) {
      this.selectedDetails = this.navParams.get('cItem');
      this.isEdit = true;
      if (this.selectedDetails.size.sSize > 0) {
        this.shoeSizeValue = this.selectedDetails.size.sSize;
      } else if (this.selectedDetails.size.cSize !== '') {
        this.clothesSize = this.selectedDetails.size.cSize;
        this.clothesSizeFilter = this.stringToSize(
          this.selectedDetails.size.cSize
        );
      } else if (this.selectedDetails.size.kSize > 0) {
        this.kidHelper = this.selectedDetails.size.kSizeHelp;
        this.kidSize = this.selectedDetails.size.kSize;
        this.kidSizeValue = this.selectedDetails.size.kSize;
      }
      this.setBrandDisplayName();
    } else {
      this.clothesSizeFilter = 3;
      this.clothesSize = this.sizeToString(3);

      //this.selectedDetails.size.cSize = this.sizeToString(3);
      //this

      this.shoeSizeValue = 36;

      this.kidSize = 44;
      this.kidHelper = this.sizeToString(44);
      console.log(
        'ngOnInit selected details',
        JSON.stringify(this.selectedDetails)
      );
    }
  }

  getFiltersFromStorage() {
    this.db.getFiltersFromDataBase().subscribe(filtersFromDB => {
      if (filtersFromDB) {
        this.filtersFromDB = filtersFromDB;
        this.filterConditions = this.transform(filtersFromDB, 'filter');
        if (this.filterConditions['color']) {
          this.filterConditions['color'].map(color => {
            this.colorController[color.name] = false;
            if (this.isEdit && this.selectedDetails.color.length > 0) {
              this.selectedDetails.color.forEach((element, index) => {
                this.colorController[element] = true;
              });
            }
          });
        }
        this.initializeClothes();
        this.setBrandDisplayName();
      }
    });
  }

  setFilterConditions() {
    if (this.filterConditions) {
      this.setBrand();
    } else {
      console.log('Delay!');
      this.delay(100).then(res => {
        this.setFilterConditions();
      });
    }
  }

  setBrandDisplayName() {
    console.log('set brand displayName!!!!!');
    if (this.selectedDetails.brand && this.selectedDetails.brand[0]) {
      if (this.filtersFromDB) {
        this.filtersFromDB.map(filterC => {
          if (filterC.filter !== 'brand') return;
          if (filterC.name !== this.selectedDetails.brand[0]) return;
          console.log(
            'filterC display name:',
            filterC.displayName,
            ', selected Details display brand:',
            this.selectedDetails.displayBrand
          );
          this.selectedDetails.displayBrand = filterC.displayName;
        });
      }
    }
  }

  setBrand() {
    console.log('set brand!!!!!');
    if (!this.selectedDetails.displayBrand) return;
    this.filterConditions['brand'].map((brand, index) => {
      if (
        typeof brand.displayName !== 'undefined' &&
        brand.displayName === this.selectedDetails.displayBrand
      ) {
        return this.selectedDetails.brand[brand.name];
      }

      return (this.selectedDetails.brand = [
        this.selectedDetails.displayBrand
          .trim()
          .toLowerCase()
          .replace(' ', '')
      ]);
    });
  }

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
    Object.keys(groupedCollection).map(collectionNumber => {
      if (collectionNumber) {
        groupedCollection[collectionNumber].map(properties => {
          if (properties && typeof properties.icon !== 'undefined') {
            firebase
              .storage()
              .ref()
              .child(`${this.globalP.systemFilterIcons}/${properties.icon}`)
              .getDownloadURL()
              .then(url => {
                properties['link'] = url;
              })
              .catch(error => {
                return;
              });
          }
        });

        let trueValue = -1;
        let falseValue = 1;

        if (
          typeof groupedCollection[collectionNumber][0].filter !==
            'undefined' &&
          groupedCollection[collectionNumber][0].filter === 'gender'
        ) {
          trueValue = 1;
          falseValue = -1;
        }

        groupedCollection[collectionNumber].sort(function(a, b) {
          if (a.name < b.name) {
            return trueValue;
          }
          if (a.name > b.name) {
            return falseValue;
          }
          return 0;
        });

        if (
          typeof groupedCollection[collectionNumber][0].filter !==
            'undefined' &&
          groupedCollection[collectionNumber][0].filter === 'color'
        ) {
          groupedCollection[collectionNumber].sort(function(a, b) {
            if (a.sort < b.sort) {
              return -1;
            }
            if (a.sort > b.sort) {
              return 1;
            }
            return 0;
          });
        }

        if (
          typeof groupedCollection[collectionNumber][0].filter !==
            'undefined' &&
          groupedCollection[collectionNumber][0].filter === 'size'
        ) {
          const sizeGroupedCollection = groupedCollection[
            collectionNumber
          ].reduce((previous, current) => {
            if (!previous[current['belongsTo']]) {
              previous[current['belongsTo']] = [current];
            } else {
              previous[current['belongsTo']].push(current);
            }

            return previous;
          }, {});
          Object.keys(sizeGroupedCollection).map(sizeCollNumber => {
            sizeGroupedCollection[sizeCollNumber].sort(function(a, b) {
              if (
                typeof a.name === 'undefined' ||
                typeof b.name === 'undefined'
              )
                return 0;
              if (a.name < b.name) {
                return trueValue;
              }
              if (a.name > b.name) {
                return falseValue;
              }
              return 0;
            });

            //this.sizeValues['lower'] = sizeGroupedCollection[sizeCollNumber][0].name
            //this.sizeValues['upper'] = sizeGroupedCollection[sizeCollNumber][sizeGroupedCollection[sizeCollNumber].length - 1].name
          });
          groupedCollection[collectionNumber] = sizeGroupedCollection;
        }
      }
    });

    return groupedCollection;
  }
  stringToSize(size) {
    switch (size) {
      case 'XS':
        return 1;
        break;
      case 'S':
        return 2;
        break;
      case 'M':
        return 3;
        break;
      case 'L':
        return 4;
        break;
      case 'XL':
        return 5;
        break;
      case 'XXL':
        return 6;
        break;
      case '3XL':
        return 7;
        break;
    }
  }

  sizeToString(size) {
    switch (size) {
      case 1:
        return 'XS';
        break;
      case 2:
        return 'S';
        break;
      case 3:
        return 'M';
        break;
      case 4:
        return 'L';
        break;
      case 5:
        return 'XL';
        break;
      case 6:
        return 'XXL';
        break;
      case 7:
        return '3XL';
        break;
      case 44:
        return '0 month';
        break;
      case 50:
        return '0 month';
        break;
      case 56:
        return '2 months';
        break;
      case 62:
        return '3 months';
        break;
      case 68:
        return '6 months';
        break;
      case 74:
        return '9 months';
        break;
      case 80:
        return '12 months';
        break;
      case 86:
        return '16 months';
        break;
      case 92:
        return '2 years';
        break;
      case 98:
        return '2 years';
        break;
      case 104:
        return '3 years';
        break;
      case 110:
        return '4 years';
        break;
      case 116:
        return '5 years';
        break;
      case 122:
        return '6 years';
        break;
      case 128:
        return '7 years';
        break;
      case 134:
        return '8 years';
        break;
      case 140:
        return '9 years';
        break;
      case 146:
        return '10 years';
        break;
      case 152:
        return '11 years';
        break;
      case 158:
        return '12 years';
        break;
      case 164:
        return '13 years';
        break;
      case 170:
        return '14+ years';
        break;
      default:
        break;
    }
  }

  setBadge(value, type) {
    this.hasSetBadge = true;
    if (type === 'type') {
      this.clothesSize = this.sizeToString(value);
      this.selectedDetails.size.cSize = this.sizeToString(value);
      this.selectedDetails.size.type = 'cSize';
    } else if (type === 'shoes') {
      this.selectedDetails.size.type = 'sSize';
      this.selectedDetails.size.sSize = value;
    } else if (type === 'kids') {
      this.selectedDetails.size.type = 'kSize';
      this.kidSize = value;
      this.kidHelper = this.sizeToString(value);
      this.selectedDetails.size.kSizeHelp = this.sizeToString(value);
      this.selectedDetails.size.kSize = value;
    } else if (type === 'distance') {
      if (value === 7) return;
    }
  }

  setDetails(detail, value) {
    if (detail && value && this.selectedDetails[detail]) {
      if (detail === 'color') {
        this.selectedDetails.colorDisplayName = value;
        if (this.selectedDetails[detail].length > 0) {
          let index = this.selectedDetails[detail].indexOf(value.toLowerCase());
          if (index < 0) {
            this.selectedDetails[detail].push(value.toLowerCase());
            this.colorController[value] = true;
          } else {
            this.selectedDetails[detail].splice(index, 1);
            this.colorController[value] = false;
          }
        } else {
          this.selectedDetails[detail] = [value.toLowerCase()];
          this.colorController[value] = true;
        }
      } else {
        if (this.selectedDetails[detail].length > 0) {
          if (this.selectedDetails[detail].indexOf(value) > -1) {
            this.selectedDetails[detail] = [];
          } else {
            this.selectedDetails[detail] = [];
            this.selectedDetails[detail] = [value.toLowerCase()];
          }
        } else {
          this.selectedDetails[detail] = [value.toLowerCase()];
        }
      }

      if (detail === this.globalP.nameOfGenderFilter) {
        let shouldBeDeleted = [];
        this.selectedDetails.type.map((typeInFilter, index) => {
          this.filtersFromDB.map(filterC => {
            if (filterC.filter !== 'type') return;
            if (filterC.name !== typeInFilter) return;
            let isIn = false;
            filterC.belongsTo.map(genderinBelongsTo => {
              if (this.selectedDetails.gender.indexOf(genderinBelongsTo) > -1)
                isIn = true;
            });
            if (!isIn) shouldBeDeleted.push(typeInFilter);
          });
        });

        shouldBeDeleted.map(typeName => {
          let typeIndex = this.selectedDetails.type.indexOf(typeName);
          this.selectedDetails.type.splice(typeIndex, 1);
        });

        this.initializeClothes();

        if (this.selectedDetails.gender.length > 0 && value === 'shoes') {
          this.setShoesRange(this.selectedDetails.gender, value);
        } else {
          this.setShoesRange(Object.keys(this.globalP.shoesSizes[0]), value);
        }
      }
    }
  }

  setShoesRange(rangeModifiers, value) {
    this.shoesRangeMin = 0;
    this.shoesRangeMax = 0;

    rangeModifiers.map((gender, index) => {
      let min = this.globalP.shoesSizes[0][gender].min;
      let max = this.globalP.shoesSizes[0][gender].max;

      if (index === 0) {
        this.shoesRangeMin = min;
        this.shoesRangeMax = max;
      }

      if (this.shoesRangeMin > min) {
        this.shoesRangeMin = min;
      }

      if (this.shoesRangeMax < max) {
        this.shoesRangeMax = max;
      }
    });
    if (
      typeof this.selectedDetails.size !== 'undefined' &&
      typeof this.selectedDetails.size.sSize !== 'undefined'
    ) {
      if (!this.selectedDetails.size.sSize) {
        this.shoeSize = this.shoesRangeMin;
      } else if (this.selectedDetails.size.sSize) {
        this.shoeSize = this.selectedDetails.size.sSize;
      }
    } else {
      this.shoeSize = value;
    }
    //this.selectedDetails.size.sSize = value;
  }

  initializeClothes() {
    this.filterConditions[this.globalP.nameOfClothesFilter] = [];
    if (this.selectedDetails.gender.length > 0) {
      // all those clothes have to be displayed as selectable which belongs to the filter inside this.selectedDetails[gender] array
      this.selectedDetails.gender.map(genderFilter => {
        // the new conditions come from the database
        this.filtersFromDB.map(dbItem => {
          if (
            typeof dbItem.filter === 'undefined' ||
            dbItem.filter !== this.globalP.nameOfClothesFilter
          )
            return;
          if (
            typeof dbItem.belongsTo === 'undefined' ||
            dbItem.belongsTo.indexOf(genderFilter) < 0
          )
            return;
          /*
           * if a dbItem is a cloth filter and it is belongs to one of the genderFilter values from this.selectedDetails[gender], then it
           * should be part of the this.newFilterConditions, but it has to be check wether it is already in the array
           */
          let conditionIsNotExist = true;
          this.filterConditions[this.globalP.nameOfClothesFilter].map(
            condition => {
              if (
                typeof condition.name !== 'undefined' &&
                typeof dbItem.name !== 'undefined' &&
                condition.name === dbItem.name
              )
                conditionIsNotExist = false;
            }
          );
          if (conditionIsNotExist)
            this.filterConditions[this.globalP.nameOfClothesFilter].push(
              dbItem
            );
        });
      });
    } else {
      // if there is not any gender filter in the this.selectedDetails[filter] array, all clothes should be displayed
      this.filtersFromDB.map(dbItem => {
        if (
          typeof dbItem.filter === 'undefined' ||
          dbItem.filter !== this.globalP.nameOfClothesFilter
        )
          return;
        this.filterConditions[this.globalP.nameOfClothesFilter].push(dbItem);
      });
    }

    this.filterConditions[this.globalP.nameOfClothesFilter].sort(function(
      a,
      b
    ) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }

  async upload() {
    if (this.hasSetBadge === false) {
      this.setDefaultSize();
      console.log(
        'selected details default value',
        JSON.stringify(this.selectedDetails)
      );
    }
    console.log(
      'Upload method selected details',
      JSON.stringify(this.selectedDetails)
    );
    const isNew = await this.checkForNewBrand();
    if (isNew === true) {
      this.saveNewBrandInDb();
    }

    if (!this.isEdit) {
      let currentDate = new Date();
      this.selectedDetails.id = uuid();
      this.selectedDetails.uploadDate = currentDate.toISOString();
    }

    if (this.selectedDetails.color.length > 0) {
      if (this.selectedDetails.color.length > 1) {
        this.selectedDetails.colorDisplayName = 'Multi Color';
      }
    }

    let brandName = 'No brand';

    if (this.selectedDetails.brand.length > 0) {
      brandName = this.selectedDetails.brand[0];
    }

    let typeName = 'No type';

    if (this.selectedDetails.type.length > 0) {
      let isExist = false;

      this.filtersFromDB.map(filter => {
        if (filter.filter !== 'type') return false;
        if (filter.name === this.selectedDetails.type[0]) {
          isExist = true;
          typeName = filter.displayName;
        }
      });

      let description = 'No description';

      if (this.selectedDetails.desc) description = this.selectedDetails.desc[0];
    }

    this.selectedDetails.title = this.selectedDetails.displayBrand;

    this.storage.getData('signedToken').subscribe(async userID => {
      if (!userID) {
        window.open();
        this.navCtrl.push(LoginPage, {
          selectedDetails: this.selectedDetails,
          DbFilters: this.filtersFromDB,
          photos: this.navParams.get('photos')
        });
      } else {
        this.setUserInfo().then(done => {
          if (done) {
            this.saveImages().then(result => {
              if (this.isEdit) {
                this.updateItem();
              } else {
                this.saveToDb();
              }
            });
          }
        });
      }
    });
  }

  setDefaultSize() {
    var type = this.selectedDetails.type[0];
    var gender = this.selectedDetails.gender[0];

    if (type === 'shoes') {
      this.selectedDetails.size.type = 'sSize';
      this.selectedDetails.size.sSize = 36;
    } else if (gender === 'kid' && type !== 'shoes') {
      this.selectedDetails.size.kSize = 44;
      this.selectedDetails.size.kSizeHelp = this.sizeToString(44);
    } else if (type !== 'shoes' && gender !== 'kid') {
      this.selectedDetails.size.type = 'cSize';
      this.selectedDetails.size.cSize = this.sizeToString(3);
    }
  }
  async saveImages() {
    let imgProcessedCount = 0;
    return new Promise((resolve, reject) => {
      if (!this.isEdit) {
        this.photos = this.navParams.get('photos');
      } else {
        this.photos = this.navParams.get('newBase64');
      }
      if (this.photos && this.photos.length > 0) {
        this.photos.forEach(async (element, index) => {
          this.b64toBlob(element, 'image/jpeg').then(result => {
            var pictureRef = index + uuid() + '.jpg';

            this.storage.uploadToFirebase(result, pictureRef).then(res => {
              if (this.isEdit) {
                this.selectedDetails.img[
                  this.selectedDetails.img.length
                ] = pictureRef;
              } else {
                this.selectedDetails.img[index] = pictureRef;
              }
              imgProcessedCount++;
              if (imgProcessedCount === this.photos.length) {
                return resolve(true);
              }
            });
          });
        });
      } else {
        resolve(false);
      }
    });
  }

  private b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    return new Promise((resolve, reject) => {
      let byteCharacters;

      if (b64Data.split(',')[0].indexOf('base64') >= 0)
        byteCharacters = atob(b64Data.split(',')[1]);
      else byteCharacters = unescape(b64Data.split(',')[1]);

      const byteArrays = [];

      for (
        let offset = 0;
        offset < byteCharacters.length;
        offset += sliceSize
      ) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      return resolve(blob);
    });
  };

  saveToDb() {
    this.db.setNewClothingItem(this.selectedDetails).subscribe(info => {
      this.storage.removeData('selectedDetails').subscribe(selectedDetails => {
        this.navCtrl.setRoot(MarketplacePage, {comeFrom: 'reFresh'});
      });
    });
  }

  updateItem() {
    this.db.getDocIDFromDataBase(this.selectedDetails.id).subscribe(docId => {
      if (docId) {
        this.db
          .updateClothingData(docId, this.selectedDetails)
          .then(res => {
            this.navCtrl.setRoot(MarketplacePage, {comeFrom: 'reFresh'});
          })
          .catch(error => JSON.stringify(error));
      }
    });
  }

  removeBrand() {
    this.isNewBrand = false;
    this.selectedDetails.brand = [];
  }

  checkForNewBrand(): Promise<boolean> {
    let match = 0;
    return new Promise((resolve, reject) => {
      this.filterConditions['brand'].forEach((element, index) => {
        console.log('TCL: element', element);
        if (
          element.displayName.toString() ===
          this.selectedDetails.displayBrand.toString()
        ) {
          match++;

          return resolve(false);
        }
      });
      if (match === 0) return resolve(true);
    });
  }

  saveNewBrandInDb() {
    const newBrand = {
      filter: 'brand',
      name: this.selectedDetails.brand,
      displayName: this.selectedDetails.displayBrand
    };
    console.log('TCL: saveNewBrandInDb -> newBrand', newBrand);

    this.db.setBrandInDatabase(newBrand).subscribe(res => {});
  }

  ionViewWillLeave() {
    this.storage
      .setData('selectedDetails', this.selectedDetails)
      .subscribe(info => {});
  }

  openSearchPage() {
    this.navCtrl.push(SearchPage, {
      filters: this.selectedDetails,
      side: 'selectCategory'
    });
  }

  setUserInfo() {
    return new Promise((returns, reject) => {
      this.storage.getData('signedToken').subscribe(userID => {
        if (userID) {
          this.db.getUserFromDataBase(userID).subscribe(user => {
            if (user) {
              this.selectedDetails.uploader.uid = userID;
              this.selectedDetails.uploader.city = user.city;
              this.selectedDetails.uploader.phone = user.phone;
              this.selectedDetails.uploader.name = user.name;
              this.selectedDetails.uploader.postalCode = user.postalCode;
              return returns(true);
            }
          });
        }
      });
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  back() {
    // itt át kell adni a fényképeket is, hogy az töltsön be visszapusholáskor !!
    this.navCtrl.pop();
  }

  next() {
    this.navCtrl.push(UploadconfirmationPage);
  }
}
