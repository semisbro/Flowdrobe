import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { SelectcategoryPage } from "../selectcategory/selectcategory";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import {
  removeBackgroundFromImageBase64,
  RemoveBgResult,
  RemoveBgError
} from "remove.bg";
import {StorageProvider} from "../../providers/storage/storage";
import { GlobalProvider } from '../../providers/global/global';
//import {AdminhomePage} from "../adminhome/adminhome";
import {DatabaseProvider} from "../../providers/database/database";
import { ImageService } from "../../services/image-Service";

@IonicPage()
@Component({
  selector: "page-uploadpicture",
  templateUrl: "uploadpicture.html"
})
export class UploadpicturePage {

  newBase64Index: number = 0;
  cItem: any;
  selectedDetails = {
    colorDisplayName: "",
    condition: [],
    displayBrand: "",
    gender: [],
    type: [],
    img: [],
    color: [],
    title: "",
    brand: [],
    desc: "",
    size:{
      type: "",
      cSize: "",
      sSize: 0,
      kSize: 0,
      kSizeHelp: ""
    },
    id: "",
    price: 0,
    status: "available",
    uploader: "",
    location: "",
    uploadDate: new Date().toISOString(),
  };
  isFirstPhoto: boolean = false;
  image: any;
  photos: Array<any> = [];
  editPhotos:Array<any> = [];
  newBase64:Array<any> = [];
  imageHolderNumber: number = 0;
  firstHelper: boolean = true;
  secondHelper: boolean = false;
  thirdHelper: boolean = false;
  fourthHelper: boolean = false;

  isEdit = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    private sanitizer: DomSanitizer,
    private camera: Camera,
    private storage: StorageProvider,
    private imageService: ImageService,
    private db: DatabaseProvider
  ) {}

  ionViewWillEnter(){
    if(this.navParams.get("cItem")) {
      this.isEdit = true;
      let object = this.navParams.get("cItem")

      object.map(a => {
        this.selectedDetails = a;
      })

      this.selectedDetails.img.forEach((element, index) => {
        this.editPhotos.push(element);
        this.storage.getData(element).subscribe(res => {
          this.imageService.getImageURL(element).then(url => {
            this.photos[index] = url
            this.setImageHolderToLowest()
          });
        })
      })

    }

  }

  takePictures() {

    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      targetWidth: 720,
      targetHeight: 720
    };

    this.camera
      .getPicture(options)
      .then(imageData => {
        const currentImageHolder = this.imageHolderNumber;
        const base64 = "data:image/*;charset=utf-8;base64,".concat(imageData);
        if (this.isEdit){
          this.newBase64[this.newBase64Index] = base64;
          this.newBase64Index += 1;
        }
        this.photos[currentImageHolder] = base64;
        this.setImageHolderToLowest();
        if (currentImageHolder === 0 || currentImageHolder === 1) {
          this.removeBackground(currentImageHolder, imageData);
        }
      })
      .catch(reject => console.log("Camera error", JSON.stringify(reject)));

  }

  getBackground(image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  getPictures() {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then(
      imageData => {
        const currentImageHolder = this.imageHolderNumber;
        const base64 = "data:image/*;charset=utf-8;base64,".concat(imageData);
        if (this.isEdit){
          this.newBase64[this.newBase64Index] = base64;
          this.newBase64Index += 1;

        }
        this.photos[currentImageHolder] = base64;
        this.setImageHolderToLowest();
        if (currentImageHolder === 0 || currentImageHolder === 1){
        this.removeBackground(currentImageHolder, imageData);
        }
      },
      err => {
        // Handle error
        console.error("Could not get iamge!", err);
        throw err;
      }
    ).catch(error => console.log("No image available", error));

  }

  private removeBackground = (
    currentImageHolder,
    base64WithoutMime: string
  ) => {
    removeBackgroundFromImageBase64({
      base64img: base64WithoutMime,
      apiKey: "SqSyTDBWf3cNC4cL29KtMefu"
    })
      .then((result: RemoveBgResult) => {
        this.photos[
          currentImageHolder
        ] = "data:image/*;charset=utf-8;base64,".concat(result.base64img);
        if (this.isEdit){
          this.newBase64Index--
          this.newBase64[this.newBase64Index] = "data:image/*;charset=utf-8;base64,".concat(result.base64img);
          this.newBase64Index++
        }
      })
      .catch((errors: Array<RemoveBgError>) => {
        console.error("error", JSON.stringify(errors));
      });
  };

  deleteImage(number) {
    if (this.isEdit){
      let array = []
      delete this.editPhotos[number]
      this.editPhotos.forEach((element, index) => {
        if(element !== null)
        array[index] = element
      })
      this.selectedDetails.img = array.filter(function (el) {   return el != null; });

    }
    delete this.photos[number];

    this.setImageHolderToLowest();

  }

  setImageHolderToLowest() {
    let photoKeys = Object.keys(this.photos);

    if (photoKeys[0] !== "0") return this.selectImageHolder(0);
    if (photoKeys[1] !== "1") return this.selectImageHolder(1);
    if (photoKeys[2] !== "2") return this.selectImageHolder(2);
    if (photoKeys[3] !== "3") return this.selectImageHolder(3);
  }

  selectImageHolder(number) {

    this.imageHolderNumber = number;

    let elem = <HTMLElement>(
      document.querySelector(
        ".footerElementHolder .footerImageCol:nth-child(" +
          (number + 1) +
          ") .imageContainer"
      )
    );
    elem.classList.add("currentImageHolder");

    for (let index = 0; index < 4; index++) {
      if (index === number) continue;
      let elem = <HTMLElement>(
        document.querySelector(
          ".footerElementHolder .footerImageCol:nth-child(" +
            (index + 1) +
            ") .imageContainer"
        )
      );
      elem.classList.remove("currentImageHolder");
    }

    switch (number) {
      case 0:
        this.firstHelper = true;
        this.secondHelper = false;
        this.thirdHelper = false;
        this.fourthHelper = false;
        break;
      case 1:
        this.firstHelper = false;
        this.secondHelper = true;
        this.thirdHelper = false;
        this.fourthHelper = false;
        break;
      case 2:
        this.firstHelper = false;
        this.secondHelper = false;
        this.thirdHelper = true;
        this.fourthHelper = false;
        break;
      case 3:
        this.firstHelper = false;
        this.secondHelper = false;
        this.thirdHelper = false;
        this.fourthHelper = true;
        break;
      default:
        break;
    }
  }

  openInformationPage() {
    if(this.isEdit){
      this.navCtrl.push(SelectcategoryPage, { cItem: this.selectedDetails, newBase64: this.newBase64 });
    }else{
      let array = []
      this.photos.forEach((element, index) =>{
        if (element !== null)
        array[index] = element
      })
      this.photos = array;
      this.navCtrl.push(SelectcategoryPage, { photos: this.photos });
    }

  }

  openAdminhomePage() {
    this.navCtrl.pop();
  }
}
