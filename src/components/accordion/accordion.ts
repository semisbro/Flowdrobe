import { Component, ViewChild, OnInit, Renderer, Input } from '@angular/core';

@Component({
  selector: 'accordion',
  templateUrl: 'accordion.html'
})
export class AccordionComponent implements OnInit {

  accordionExpanded = false;
  @ViewChild("cc") cardContent: any;
  @Input('orderNo') orderNo: string;
  @Input('quantity') quantity: string;
  @Input('date') date: string;
  @Input('sum') sum: string;
  @Input('statusValue') statusValue: string;
  myColor: string = "#efca27";

  icon: string = "ios-arrow-forward-outline";

  constructor(public renderer: Renderer) {

  }

  ngOnInit() {
    this.renderer.setElementStyle(this.cardContent.nativeElement, "webkitTransition", "max-height 500ms, padding 500ms");
    switch (this.statusValue) {
      case "Waiting for packaging":
        this.myColor = "#efca27";
        break;
    }
  }

  toggleAccordion() {
    if (this.accordionExpanded) {
      this.renderer.setElementStyle(this.cardContent.nativeElement, "max-height", "0px");
      this.renderer.setElementStyle(this.cardContent.nativeElement, "padding", "0px 16px");
    } else {
      this.renderer.setElementStyle(this.cardContent.nativeElement, "max-height", "1000px");
      this.renderer.setElementStyle(this.cardContent.nativeElement, "padding", "13px 16px");
    }

    this.accordionExpanded = !this.accordionExpanded;
    this.icon = this.icon == "ios-arrow-forward-outline" ? "ios-arrow-down-outline" : "ios-arrow-forward-outline";
  }

  deliveryReady() {
  }

}
