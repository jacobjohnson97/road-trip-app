import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss'],
})
export class MyTripsComponent implements OnInit {

  constructor(private modalController: ModalController, private alertController: AlertController, private toastController: ToastController, private http : HttpClient) { }

  ngOnInit() {
    this.awaitGetTrips = true;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer ' + localStorage.getItem('sectok')
      })
    }
    this.http.get(`http://34.70.173.192:3000/api/trip`, httpOptions).subscribe((response) => {
      this.awaitGetTrips = false;
      this.trips = response;
    }, (err) => {
      this.dangerToast('Something went wrong. Please try again later.');
      this.awaitGetTrips = false;
    });
  }

  trips : any = [];
  hover : number;
  awaitGetTrips : boolean;
  awaitDeleteTrip : boolean;

  async selectTrip(tripIndex : number) {
    await this.modalController.dismiss(JSON.stringify(this.trips[tripIndex]['trip']));
  }

  async deleteTrip(tripIndex : number) {
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
            this.awaitDeleteTrip = true;
            const httpOptions = {
              headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + localStorage.getItem('sectok')
              })
            };
            this.http.delete(`http://34.70.173.192:3000/api/trip?tripID=${this.trips[tripIndex]['_id']}`, httpOptions).subscribe((response) => {
              this.successToast('Trip deleted successfully!');
              this.awaitDeleteTrip = false;
              this.ngOnInit();
            }, (err) => {
              this.dangerToast('Something went wrong. Please try again later.');
              this.awaitDeleteTrip = false;
            });
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
