import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickupChosserPage } from './pickup-chosser';

@NgModule({
  declarations: [
    PickupChosserPage,
  ],
  imports: [
    IonicPageModule.forChild(PickupChosserPage),
  ],
})
export class PickupChosserPageModule {}
