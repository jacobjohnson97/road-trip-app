import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { SearchCardComponent } from '../search-card/search-card.component';
import { LoginCardComponent } from '../login-card/login-card.component';
import { MyTripsComponent } from '../my-trips/my-trips.component';
import { HttpClient } from '@angular/common/http';
import { } from 'googlemaps';

enum TravelMode {
  BICYCLING = 'BICYCLING',
  DRIVING = 'DRIVING',
  TRANSIT = 'TRANSIT',
  TWO_WHEELER = 'TWO_WHEELER',
  WALKING = 'WALKING',
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChild('gmap', {static: false}) gmapElement: any;
  map: google.maps.Map;

  constructor(private modalController: ModalController, private alertController: AlertController, public toastController: ToastController, public http : HttpClient) {
    if (localStorage.getItem('sectok')) {
      this.loggedIn = true;
    }
  }

  TravelMode = TravelMode;
  selectedCard : number = null;
  loggedIn : boolean = false;
  awaitSaveTrip : boolean;
  trips : any[] = [];
  places : any[] = [];//[{name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}, {name: 'Name', imgSrc: '../../assets/shapes.svg', rating: '4/5'}]

  ngAfterViewInit() {
    let mapProp = {
      zoom: 7,
      center: {lat: 40.0150, lng: -105.2705},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  async openSearchModal() {
    const modal = await this.modalController.create({
      component: SearchCardComponent,
      componentProps: {},
    });
    await modal.present();
    let searchData = await modal.onWillDismiss();
    this.renderWaypointData(searchData['data']);
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
    let tripData = await modal.onWillDismiss();
    this.renderWaypointData(tripData['data']);
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

  renderWaypointData(data : any) {
    if (data != '{}') {
      data = JSON.parse(data);
      console.log('Rendering:', data)

      let directionsService = new google.maps.DirectionsService();
      let directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(this.map);

      this.places = data.waypoints;
      let waypoints = data.waypoints.map((waypoint => {
        return {'location': waypoint.geometry.location};
      }))

      // Calculate and render route
      let DRIVING = 'DRIVING'
      directionsService.route(
        {
          origin: data.origin,
          destination: data.destination,
          waypoints: waypoints,
          travelMode: TravelMode.DRIVING
        },
        function(response, status) {
          if (status === 'OK') {
            directionsRenderer.setDirections(response);
          } else {
            this.dangerToast('Something went wrong. Please try again later.');
            console.log('Directions request failed due to ' + status);
          }
      });
    }
  }

}
