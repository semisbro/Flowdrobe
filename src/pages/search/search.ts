import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalProvider } from '../../providers/global/global';
import { DatabaseProvider } from '../../providers/database/database';
import { StorageProvider } from '../../providers/storage/storage';
import { FilterPage } from '../filter/filter';
import { SelectcategoryPage } from '../selectcategory/selectcategory';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  brands: Array<string> = []
  brandsFromDB: Array<string|any> = []
  filters: Array<string|any> = []
  side: string = 'filter'
  searchValue:any;
  isNotNewBrand: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public globalP: GlobalProvider, public db: DatabaseProvider, public storage: StorageProvider) {

    this.db.getFiltersFromDataBase().subscribe(filtersFromDB=>{
      if(!filtersFromDB) return

      this.brandsFromDB = filtersFromDB.filter(filterObj=>{
        if(typeof filterObj.filter === 'undefined') return false
        if(filterObj.filter === globalP.nameOfBrandFilter) return true
      })

      this.brandsFromDB.sort(function(a, b){
        if(a.displayName < b.displayName) { return -1; }
        if(a.displayName > b.displayName) { return 1; }
        return 0;
      })

      this.brands = this.brandsFromDB
      
      if(typeof this.navParams.get('filters') !== 'undefined') {
        this.filters = this.navParams.get('filters')
      }

      this.side = this.navParams.get('side')
    })


  }

  getItems(ev: any) {

    this.brands = this.brandsFromDB
    const val = ev.target.value;

    // if the value is an empty string don't filter theproducts
    if (val && val.trim() !== '') {
      this.brands = this.brands.filter((brand) => {
        if (typeof brand['displayName'] === 'undefined') return false
        return (brand['displayName'].toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  selectedItem(item) {
    this.isNotNewBrand = true
    let index = this.filters[this.globalP.nameOfBrandFilter].indexOf(item)

    if(this.side === 'filter') {
      if (index < 0) {
        this.filters[this.globalP.nameOfBrandFilter].push(item)
      } else {
        this.filters[this.globalP.nameOfBrandFilter].splice(index, 1)
      }
    } else if(this.side === 'selectCategory') {
      this.filters[this.globalP.nameOfBrandFilter] = []
      console.log("Item in search",item)
      this.filters[this.globalP.nameOfBrandFilter].push(item)
      this.brandsFromDB.map(dbItem =>{
        if (item === dbItem["name"]){
          this.filters["displayBrand"] = dbItem["displayName"]
          console.log("FOUND!!! IT IS HERE!!!!!")
        }

      })
    }
    
  }

  ionViewWillLeave() {
    if(this.side === 'filter') {
      this.storage.setData('newFilters', this.filters).subscribe((info) => {});
    } else if(this.side === 'selectCategory') {
      console.log("filters:", JSON.stringify(this.filters))
      this.storage.setData('selectedDetails', this.filters).subscribe((info) => {});
    }
  }

  backToFiler() {
    console.log("isNewBrand boolean", this.isNotNewBrand)
      if(!this.isNotNewBrand){
        console.log("YOU SHALL NOT PASS!!!")
        if (this.side === 'selectCategory' && this.searchValue.length > 0){
          this.filters["displayBrand"] = ""
          this.filters["displayBrand"] = this.searchValue
          this.filters["brand"] = this.searchValue.trim().toLowerCase().replace(" ", '')
      }
      }

    if(this.side === 'filter') {
      this.navCtrl.pop()
    } else if(this.side === 'selectCategory') {
      this.navCtrl.pop()
    }
  }

  back(){
    this.navCtrl.pop()
  }

}
