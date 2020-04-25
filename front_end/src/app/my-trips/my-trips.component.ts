import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss'],
})
export class MyTripsComponent implements OnInit {

  constructor(private modalController: ModalController, private alertController: AlertController, private toastController: ToastController) { }

  ngOnInit() {
    // http get trips
  }

  trips : any[] = [{name: 'Trip 1', date: '03-30-20'}, {name: 'Trip 2', date: '03-30-20'}];
  hover : number;

  async closeModal() {
    await this.modalController.dismiss('{}');
  }

  async selectTrip(trip : number) {
    await this.modalController.dismiss(JSON.stringify(this.trips[trip]));
  }

  async deleteTrip(trip : number) {
    const alert = await this.alertController.create({
      header: 'Delete',
      message: 'Are you sure you want to delete this trip?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            // http request here
            let error = false;
            if (!error) {
              this.successToast('Trip successfully deleted!')
              this.trips.splice(trip, 1);
            } else {
              this.dangerToast('Something went wrong. Please try again later.')
            }
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
