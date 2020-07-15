import firebase from "firebase/app"
import { GlobalProvider } from "../providers/global/global"
import { Injectable } from "@angular/core";

@Injectable()
export class ImageService {
  constructor(private globalP: GlobalProvider) {}

  getImageURL = (image: string): Promise<any> => {
    return firebase
      .storage()
      .ref()
      .child(`${this.globalP.storageName}/${image}`)
      .getDownloadURL()
  }

  getImagesURLs = (images: string[]): Promise<any[]> => {
    const promises = []

    images.forEach(img => {
      promises.push(this.getImageURL(img))
    })

    return Promise.all(promises)
  }
}
