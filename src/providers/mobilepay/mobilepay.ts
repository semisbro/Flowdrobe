import {Injectable} from "@angular/core";

@Injectable()
export class MobilePayMessagesProvider {

   public MERCHANT_ID = 'APPDK0000000000';
   public URL_SCHEME = 'flowrobemobilepay';

   // Technical error
   public ERROR_HDR = 'Error!';
   public TECH_ERR_SUB = 'A technical error occured';
   public TECH_ERR_MSG = 'Please try again. If the error persists please contact the administrator. Error code: ';

   // Mobilepay app not found on device
   public NOT_FOUND_SUB = 'MobilePay not found';
   public NOT_FOUND_MSG = 'It seems that MobilePay is not installed on your device. Please install MobilePay and try again';

   // Purchase completed
   public PUR_COMP_HDR = 'Purchase completed!';
   public PUR_COMP_MSG = 'A reciept has been sent to your email. Thank you for your purchase';

   // Transaction timeout
   public TRANS_TOUT_SUB = 'MobilePay timeout';
   public TRANS_TOUT_MSG = 'The transaction timed out. Please try again.';

   // Mobilepay app out of date
   public MP_OOD_SUB = 'MobilePay out of date';
   public MP_OOD_MSG = 'Your version of MobilePay is out of date. Please update and try again.';

   //Amount limit exceeded
   public AML_EXC_SUB = 'Amount limit exceeded';
   public AML_EXC_MSG = 'Please check your amount limits under "beløbsgrænser" in your MobilePay app';

   // Reservation period exceeded
   public RES_PER_EXC_SUB = 'product reservation period exceeded';
   public RES_PER_EXC_MSG = 'Your products are no longer reserved to you. something something restart purchase something something';
}