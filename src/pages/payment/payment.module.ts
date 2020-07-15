import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentPage } from './payment';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    PaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentPage),
    BrMaskerModule
  ],
})
export class PaymentPageModule {}
