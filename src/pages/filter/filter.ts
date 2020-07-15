import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';
import * as firebase from 'firebase/app';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalProvider } from '../../providers/global/global';
import { SearchPage } from '../search/search';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html'
})
export class FilterPage {
  filtersFromDB: Array<any>;
  newFilterConditions: Array<any>;
  newFilters = {
    gender: [],
    type: [],
    brand: [],
    size: {
      cSize: [],
      sSize: [],
      kSize: []
    },
    condition: [],
    color: [],
    price: {
      min: [],
      max: []
    },
    distance: []
  };
  sizeValues = {
    lower: 1,
    upper: 7
  };
  sizeMin: any;
  sizeMax: any;
  shoeSizeValues: any = {
    upper: 47,
    lower: 16
  };
  shoeSizeMin: any;
  shoeSizeMax: any;
  shoesRange: {
    min: 0;
    max: 0;
  };

  shoesRangeMin: any;
  shoesRangeMax: any;

  kidSizeValues: any = {
    upper: 170,
    lower: 44
  };
  kidSizeMin: any;
  kidSizeMax: any;
  kidHelperMin: any;
  kidHelperMax: any;

  priceValues: any = {
    upper: 10000,
    lower: 0
  };
  priceMin: any;
  priceMax: any;
  priceRangeMin: any;
  priceRangeMax: any;
  distanceValue: number = 7;
  distance: any;

  colorController: any = {};

  distanceInput: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalP: GlobalProvider,
    private storage: StorageProvider,
    private db: DatabaseProvider,
    private sanitizer: DomSanitizer
  ) {
    //this.sizeValues['lower'] = 1
    //this.sizeValues['upper'] = 7
    this.sizeMin = this.sizeToString(1);
    this.sizeMax = this.sizeToString(7);
    //this.shoeSizeMin = this.shoeSizeValues.lower;
    //this.shoeSizeMax = this.shoeSizeValues.upper;
    this.kidSizeMin = this.kidSizeValues.lower;
    this.kidSizeMax = this.kidSizeValues.upper;
    this.kidHelperMin = this.sizeToString(this.kidSizeValues.lower);
    this.kidHelperMax = this.sizeToString(this.kidSizeValues.upper);
    
    this.distance = this.distanceToString(this.distanceValue);

    this.db.getFiltersFromDataBase().subscribe(filtersFromDB => {
      if (filtersFromDB) {
        this.filtersFromDB = filtersFromDB;
        this.newFilterConditions = this.transform(filtersFromDB, 'filter');
      }

      if (this.newFilterConditions['color']) {
        this.newFilterConditions['color'].map(color => {
          this.colorController[color.name] = false;
        });
      }

      this.storage.getData('newFilters').subscribe(newFilters => {
        if (newFilters) {
          this.newFilters = newFilters;
        }

        if (
          typeof this.newFilters.gender !== 'undefined' &&
          this.newFilters.gender.length > 0
        ) {
          this.setShoesRange(this.newFilters.gender);
        } else {
          if (
            typeof this.globalP.shoesSizes !== 'undefined' &&
            typeof this.globalP.shoesSizes[0] !== 'undefined'
          ) {
            this.setShoesRange(Object.keys(this.globalP.shoesSizes[0]));
          }
        }

        if (typeof this.newFilters.color !== 'undefined') {
          Object.keys(this.colorController).map(colorKey => {
            if (this.newFilters.color.indexOf(colorKey) > -1)
              return (this.colorController[colorKey] = true);
            return;
          });
        }

        if (
          typeof this.newFilters.size !== 'undefined' &&
          typeof this.newFilters.size.cSize !== 'undefined' &&
          this.newFilters.size.cSize.length > 0 &&
          typeof this.newFilterConditions['size'] !== 'undefined' &&
          typeof this.newFilterConditions['size'].type !== 'undefined'
        ) {
          if (this.newFilters.size.cSize.length === 1) {
            this.sizeValues['lower'] = this.newFilters.size.cSize[0];
            this.sizeValues['upper'] = this.newFilters.size.cSize[0];
          } else {
            this.sizeValues['lower'] = this.newFilters.size.cSize[0];
            this.sizeValues['upper'] = this.newFilters.size.cSize[
              this.newFilters.size.cSize.length - 1
            ];
          }

          this.sizeMin = this.newFilterConditions['size'].type[
            this.sizeValues['lower'] - 1
          ].displayName;
          this.sizeMax = this.newFilterConditions['size'].type[
            this.sizeValues['upper'] - 1
          ].displayName;

          this.sizeValues = Object.assign({}, this.sizeValues);
        }

        if (
          typeof this.newFilters.size !== 'undefined' &&
          typeof this.newFilters.size.kSize !== 'undefined' &&
          this.newFilters.size.kSize.length > 0
        ) {
          if (this.newFilters.size.kSize.length === 1) {
            this.kidSizeValues['lower'] = this.newFilters.size.kSize[0];
            this.kidSizeValues['upper'] = this.newFilters.size.kSize[0];
          } else {
            this.kidSizeValues['lower'] = this.newFilters.size.kSize[0];
            this.kidSizeValues['upper'] = this.newFilters.size.kSize[
              this.newFilters.size.kSize.length - 1
            ];
          }

          this.kidHelperMin = this.sizeToString(this.kidSizeValues.lower);
          this.kidHelperMax = this.sizeToString(this.kidSizeValues.upper);
          this.kidSizeMin = this.kidSizeValues.lower;
          this.kidSizeMax = this.kidSizeValues.upper;

          this.kidSizeValues = Object.assign({}, this.kidSizeValues);
        }

        //START of price filter settings
        if (typeof this.globalP.priceFilter[0]['min'] !== 'undefined') {
          this.priceRangeMin = this.globalP.priceFilter[0]['min'];
        } else {
          this.priceRangeMin = 1;
        }

        if (typeof this.globalP.priceFilter[0]['max'] !== 'undefined') {
          this.priceRangeMax = this.globalP.priceFilter[0]['max'];
        } else {
          this.priceRangeMax = 1001;
        }

        if (typeof this.newFilters.price !== 'undefined') {
          let priceMin: number;
          let priceMax: number;

          if (this.newFilters.price.min.length === 0) {
            if (typeof this.globalP.priceFilter[0]['min'] !== 'undefined') {
              priceMin = this.globalP.priceFilter[0]['min'];
            } else {
              priceMin = 0;
            }
          }

          if (this.newFilters.price.max.length === 0) {
            if (typeof this.globalP.priceFilter[0]['max'] !== 'undefined') {
              priceMax = this.globalP.priceFilter[0]['max'];
            } else {
              priceMax = 10000;
            }
          }

          if (
            this.newFilters.price.min.length !== 0 &&
            this.newFilters.price.max.length !== 0
          ) {
            priceMin = this.newFilters.price.min[0];
            priceMax = this.newFilters.price.max[0];
          }

          this.priceMin = priceMin + ' kr.';
          if (priceMax === this.globalP.priceFilter[0]['max']) {
            this.priceMax = priceMax + '+ kr.';
          } else {
            this.priceMax = priceMax + ' kr.';
          }

          this.priceValues.lower = priceMin;
          this.priceValues.upper = priceMax;
          this.priceValues = Object.assign({}, this.priceValues);
        }
        //END of price Filter settings

        this.initializeClothes();
      });
    });
  }

  ionViewWillLoad() {}

  setShoesRange(rangeModifiers) {
    this.shoeSizeMin = 0;
    this.shoeSizeMax = 0;
    this.shoesRangeMin = 0;
    this.shoesRangeMax = 0;

    rangeModifiers.map((gender, index) => {
      let min = this.globalP.shoesSizes[0][gender].min;
      let max = this.globalP.shoesSizes[0][gender].max;

      if (index === 0) {
        this.shoeSizeMin = min;
        this.shoeSizeMax = max;
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
      typeof this.newFilters.size !== 'undefined' &&
      typeof this.newFilters.size.sSize !== 'undefined' &&
      this.newFilters.size.sSize.length > 0
    ) {
      this.newFilters.size.sSize = this.newFilters.size.sSize.filter(size => {
        return size >= this.shoesRangeMin && size <= this.shoesRangeMax;
      });

      if (this.newFilters.size.sSize.length === 0) {
        this.shoeSizeMin = this.shoesRangeMin;
        this.shoeSizeMax = this.shoesRangeMax;
      } else if (this.newFilters.size.sSize.length === 1) {
        this.shoeSizeMin = this.newFilters.size.sSize[0];
        this.shoeSizeMax = this.newFilters.size.sSize[0];
      } else {
        this.shoeSizeMin = this.newFilters.size.sSize[0];
        this.shoeSizeMax = this.newFilters.size.sSize[
          this.newFilters.size.sSize.length - 1
        ];
      }
    } else {
      this.shoeSizeMin = this.shoesRangeMin;
      this.shoeSizeMax = this.shoesRangeMax;
    }

    this.shoeSizeValues.lower = this.shoeSizeMin;
    this.shoeSizeValues.upper = this.shoeSizeMax;

    this.shoeSizeValues = Object.assign({}, this.shoeSizeValues);
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

  distanceToString(distance) {
    switch (distance) {
      case 1:
        return '2 km';
        break;
      case 2:
        return '5 km';
        break;
      case 3:
        return '10 km';
        break;
      case 4:
        return '15 km';
        break;
      case 5:
        return '30 km';
        break;
      case 6:
        return '50 km';
        break;
      case 7:
        return '100+ km';
        break;
      default:
        break;
    }
  }

  setBadge(value, type) {
    if (type === 'type') {
      this.sizeMin = this.sizeToString(value.lower);
      this.sizeMax = this.sizeToString(value.upper);
      this.newFilters.size.cSize = [];
      if (value.lower === 1 && value.upper === 7) return;
      for (let index = value.lower; index < value.upper + 1; index++) {
        this.newFilters.size.cSize.push(index);
      }
    } else if (type === 'shoes') {
      this.shoeSizeMin = value.lower;
      this.shoeSizeMax = value.upper;
      this.newFilters.size.sSize = [];
      if (
        value.lower === this.shoesRangeMin &&
        value.upper === this.shoesRangeMax
      ) {
      } else {
        for (let index = value.lower; index < value.upper + 1; index++) {
          this.newFilters.size.sSize.push(index);
        }
      }
    } else if (type === 'kids') {
      this.kidSizeMin = value.lower;
      this.kidSizeMax = value.upper;
      this.kidHelperMin = this.sizeToString(value.lower);
      this.kidHelperMax = this.sizeToString(value.upper);
      this.newFilters.size.kSize = [];
      if (value.lower === 44 && value.upper === 170) return;
      for (let index = value.lower; index < value.upper + 1; index += 6) {
        this.newFilters.size.kSize.push(index);
      }
    } else if (type === 'price') {
      this.priceMin = value.lower + ' kr.';
      if (value.upper === 1000) {
        this.priceMax = value.upper + '+ kr.';
      } else {
        this.priceMax = value.upper + ' kr.';
      }
      this.newFilters.price.min = [];
      this.newFilters.price.max = [];
      if (
        value.lower === this.globalP.priceFilter[0]['min'] &&
        value.upper === this.globalP.priceFilter[0]['max']
      )
        return;

      this.newFilters.price.min.push(value.lower);
      this.newFilters.price.max.push(value.upper);
    } else if (type === 'distance') {
      this.distance = this.distanceToString(value);
      this.newFilters.distance = [];
      if (value === 7) return;
    }
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

  setFilter(filter, value) {
    if (filter && value) {
      if (this.newFilters[filter].length > 0) {
        let index = this.newFilters[filter].indexOf(value.toLowerCase());
        if (index < 0) {
          this.newFilters[filter].push(value.toLowerCase());
          if (filter === 'color') {
            this.colorController[value] = true;
          }
        } else {
          this.newFilters[filter].splice(index, 1);
          if (filter === 'color') {
            this.colorController[value] = false;
          }
          if (filter === 'type' && value === 'shoes') {
            this.shoeSizeValues.lower = this.shoesRangeMin;
            this.shoeSizeValues.upper = this.shoesRangeMax;
            this.newFilters.size.sSize = [];
            this.shoeSizeValues = Object.assign({}, this.shoeSizeValues);
          }
        }
      } else {
        this.newFilters[filter] = [value.toLowerCase()];
        //this.newFilters.isFilter = true;
        if (filter === 'color') {
          this.colorController[value] = true;
        }
      }

      //the selectable clothes is changing dynamicly when a gender was selected
      if (filter === this.globalP.nameOfGenderFilter) {
        let shouldBeDeleted = [];
        this.newFilters.type.map((typeInFilter, index) => {
          this.filtersFromDB.map(filterC => {
            if (filterC.filter !== 'type') return;
            if (filterC.name !== typeInFilter) return;
            let isIn = false;
            filterC.belongsTo.map(genderinBelongsTo => {
              if (this.newFilters.gender.indexOf(genderinBelongsTo) > -1)
                isIn = true;
            });
            if (!isIn) shouldBeDeleted.push(typeInFilter);
          });
        });

        shouldBeDeleted.map(typeName => {
          let typeIndex = this.newFilters.type.indexOf(typeName);
          this.newFilters.type.splice(typeIndex, 1);
        });

        this.initializeClothes();
        if (this.newFilters.gender.length > 0) {
          this.setShoesRange(this.newFilters.gender);
        } else {
          this.newFilters.size.sSize = [];
          this.setShoesRange(Object.keys(this.globalP.shoesSizes[0]));
        }
      }
    }
  }

  initializeClothes() {
    this.newFilterConditions[this.globalP.nameOfClothesFilter] = [];
    if (this.newFilters.gender.length > 0) {
      // all those clothes have to be displayed as selectable which belongs to the filter inside this.newFilters[gender] array
      this.newFilters.gender.map(genderFilter => {
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
           * if a dbItem is a cloth filter and it is belongs to one of the genderFilter values from this.newFilters[gender], then it
           * should be part of the this.newFilterConditions, but it has to be check wether it is already in the array
           */

          let conditionIsNotExist = true;
          this.newFilterConditions[this.globalP.nameOfClothesFilter].map(
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
            this.newFilterConditions[this.globalP.nameOfClothesFilter].push(
              dbItem
            );
        });
      });
    } else {
      // if there is not any gender filter in the this.newFilters[filter] array, all clothes should be displayed
      this.filtersFromDB.map(dbItem => {
        if (
          typeof dbItem.filter === 'undefined' ||
          dbItem.filter !== this.globalP.nameOfClothesFilter
        )
          return;
        this.newFilterConditions[this.globalP.nameOfClothesFilter].push(dbItem);
      });
    }

    this.newFilterConditions[this.globalP.nameOfClothesFilter].sort(function(
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

  clearFilters() {
    /*this.shoeSizeValues.lower = this.shoesRangeMin
    this.shoeSizeValues.upper = this.shoesRangeMax
    this.shoeSizeValues = Object.assign({}, this.shoeSizeValues)*/

    this.newFilters = {
      gender: [],
      type: [],
      brand: [],
      size: {
        cSize: [],
        sSize: [],
        kSize: []
      },
      condition: [],
      color: [],
      price: {
        min: [],
        max: []
      },
      distance: []
    };

    this.sizeValues['lower'] = 1;
    this.sizeValues['upper'] = 7;
    this.sizeValues = Object.assign({}, this.sizeValues);

    this.setShoesRange(Object.keys(this.globalP.shoesSizes[0]));

    this.initializeClothes();

    this.kidSizeValues.lower = 44;
    this.kidSizeValues.upper = 170;
    this.kidSizeValues = Object.assign({}, this.kidSizeValues);

    this.priceValues.lower = this.priceRangeMin;
    this.priceValues.upper = this.priceRangeMax;
    this.priceValues = Object.assign({}, this.priceValues);

    Object.keys(this.colorController).map(colorKey => {
      return (this.colorController[colorKey] = false);
    });
  }

  ionViewWillLeave() {
    this.storage.setData('newFilters', this.newFilters).subscribe(info => {});
  }

  removeBrand(deletedBrand) {
    if (!deletedBrand) return;
    this.newFilters.brand = this.newFilters.brand.filter(brand => {
      return brand !== deletedBrand;
    });
  }

  openSearchPage() {
    this.navCtrl.push(SearchPage, { filters: this.newFilters, side: 'filter' });
  }

  openHomePage() {
    this.navCtrl.setRoot(HomePage);
  }
}
