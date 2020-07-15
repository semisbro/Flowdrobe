import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MarketplacePage } from './marketplace';

@NgModule({
  declarations: [
    MarketplacePage,
  ],
  imports: [
    IonicPageModule.forChild(MarketplacePage),
  ],
})
export class MarketplacePageModule {}
