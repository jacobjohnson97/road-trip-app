import { Component } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { SearchCardComponent } from '../search-card/search-card.component';
import { LoginCardComponent } from '../login-card/login-card.component';
import { MyTripsComponent } from '../my-trips/my-trips.component';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private modalController: ModalController, private alertController: AlertController, public toastController: ToastController, public http : HttpClient) {
    if (localStorage.getItem('sectok')) {
      this.loggedIn = true;
    }
  }

  selectedCard : number = null;
  loggedIn : boolean = false;
  awaitSaveTrip : boolean;
  trips : any[] = [];
  places : any[] = [{name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}]

  async openSearchModal() {
    const modal = await this.modalController.create({
      component: SearchCardComponent,
      componentProps: {}
    });
    await modal.present();
  }

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginCardComponent,
      componentProps: {}
    });
    await modal.present();
  }

  async openTripsModal() {
    const modal = await this.modalController.create({
      component: MyTripsComponent,
      componentProps: {}
    });
    await modal.present();
  }

  saveTrip() {
    if (!this.loggedIn) {
      this.openLoginModal();
    } else {
      this.awaitSaveTrip = true;
      // http post
      let error = false;
      if (!error) {
        this.successToast('Trip saved successfully!');
        this.awaitSaveTrip = false;
      } else {
        this.dangerToast('Something went wrong. Please try again later.');
        this.awaitSaveTrip = false;
      }
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            localStorage.removeItem('sectok');
            this.loggedIn = false;
            this.successToast('Logout successful');
          }
        }
      ]
    });

    await alert.present();
  }

  async dangerToast(message : string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'danger',
      duration: 2000
    });
    toast.present();
  }

  async successToast(message : string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'success',
      duration: 2000
    });
    toast.present();
  }

}
