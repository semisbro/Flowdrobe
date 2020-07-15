import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the GlobalProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalProvider {
  public dbCollectionName: string = 'clothing';
  public storageName: string = 'clothing';
  public cartReservedTime: number = 10.0;
  public shippingPrice: number = 25;
  public buyerProtection: number = 2.5;
  public systemFilterIcons: string = 'system/filterIcons';
  // these value appear in filter.ts as static value but it is depending on its database value
  public nameOfGenderFilter: string = 'gender';
  public nameOfClothesFilter: string = 'type';
  public nameOfBrandFilter: string = 'brand';
  public nameOfShoesFilter: string = 'shoes';
  public nameOfConditionFilter: string = 'condition';
  // these values are the minimum and maximum values of the shoes depending on the gender


  public shoesSizes: Array<Object> = [
    {
      man: {
        max: 47,
        min: 40
      },
      woman: {
        max: 42,
        min: 35
      },
      kid: {
        max: 42,
        min: 16
      }
    }
  ];
  public priceFilter: Array<Object> = [
    {
      min: 0,
      max: 10000,
      step: 50
    }
  ];

  constructor(public http: HttpClient) {}

}
