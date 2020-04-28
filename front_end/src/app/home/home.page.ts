import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, AlertController, ToastController, MenuController } from '@ionic/angular';
import { SearchCardComponent } from '../search-card/search-card.component';
import { LoginCardComponent } from '../login-card/login-card.component';
import { MyTripsComponent } from '../my-trips/my-trips.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { } from 'googlemaps';
import { timer } from 'rxjs';
require('dotenv').config( {path: '../../.env'} );

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
  @ViewChild('gmap', {static: false}) gmapElement : any;
  map : google.maps.Map;
  currentZoom : number;
  currentCenter : any;
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  constructor(private modalController: ModalController, private alertController: AlertController, public toastController: ToastController, public http : HttpClient, public menuController : MenuController) {
    this.validateLogin();
  }

  TravelMode = TravelMode;
  selectedCard : number = null;
  loggedIn : boolean = false;
  awaitSaveTrip : boolean;
  tripSaved : boolean = false;
  newTrip : boolean = false;
  trip : any;
  places : any[] = [];
  origin : string;
  destination : string;
  photos : any[];
  placeIndexes : string[] = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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
    await this.renderWaypointData(searchData['data']);
    this.tripSaved = false;
  }

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginCardComponent,
      componentProps: {}
    });
    await modal.present();
  }

  async openTripsModal() {
    await this.validateLogin();
    if (this.loggedIn) {
      const modal = await this.modalController.create({
        component: MyTripsComponent,
        componentProps: {}
      });
      await modal.present();
      let tripData = await modal.onWillDismiss();
      await this.renderWaypointData(tripData['data']);
      this.tripSaved = true;
    } else {
      this.dangerToast('Please log in.');
    }
  }

  saveTrip() {
    this.validateLogin();
    if (!this.loggedIn) {
      this.openLoginModal();
    } else {
      this.awaitSaveTrip = true;
      let body = {
        "trip": this.trip
      }
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + localStorage.getItem('sectok')
        })
      };

      this.http.post('https://localhost:3000/api/trip', body, httpOptions).subscribe((response) => {
        this.successToast('Trip saved successfully!');
        this.awaitSaveTrip = false;
        this.tripSaved = true;
      }, (err) => {
        this.dangerToast('Something went wrong. Please try again later.');
        this.awaitSaveTrip = false;
      });
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

    if (data && data != '{}') {

      this.newTrip = true;
      this.selectedCard = null;
      this.trip = data;
      this.tripSaved = false;
      data = JSON.parse(data);
      this.origin = data['origin'];
      this.destination = data['destination'];

      console.log('Rendering:', data)

      let directionsService = this.directionsService;
      let directionsRenderer = this.directionsRenderer;

      directionsRenderer.setMap(this.map);

      this.places = data.waypoints;
      this.setPhotos();
      let waypoints = data.waypoints.map((waypoint => {
        return {'location': waypoint.geometry.location};
      }))

      // Calculate and render route
      directionsService.route(
        {
          origin: data.origin,
          destination: data.destination,
          waypoints: waypoints,
          travelMode: TravelMode.DRIVING
        },
        async function(response, status) {
          if (status === 'OK') {
            directionsRenderer.setDirections(response);
          } else {
            console.log('Directions request failed due to ' + status);
            let toastController = new ToastController();
            let toast = await toastController.create({
              message: 'There was a problem rendering your route. Please reload and try again.',
              color: 'danger',
              duration: 3000
            });
            toast.present();
          }
      });
    }
  }

  selectPlace(index : number) {
    if (this.selectedCard == index) {
      this.selectedCard = null;
      this.map.setZoom(this.currentZoom);
      this.map.setCenter(this.currentCenter);
    } else {
      this.selectedCard = index;
      if (this.newTrip) {
        this.currentZoom = this.map.getZoom();
        this.currentCenter = this.map.getCenter();
        this.newTrip = false;
      }
      this.map.setZoom(17);
      this.map.setCenter(this.places[index]['geometry']['location']);
    }
  }

  validateLogin() {
    if (localStorage.getItem('sectok')) {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + localStorage.getItem('sectok')
        })
      };
      this.http.get('https://localhost:3000/api/token', httpOptions).subscribe((response) => {
        this.loggedIn = true;
      }, (err) => {
        this.loggedIn = false;
        localStorage.removeItem('sectok')
      });

    } else {
      this.loggedIn = false;
    }
  }

  clearRoute() {
    this.directionsRenderer.set('directions', null);
    this.trip = null;
    this.origin = null;
    this.destination = null;
    this.places = [];
    this.photos = [];
    this.selectedCard = null;
    this.tripSaved = false;
    this.newTrip = false;
    this.map.setZoom(7);
    this.map.setCenter({lat: 40.0150, lng: -105.2705});
  }

  closeMenu() {
    this.menuController.close();
  }

  setPhotos() {
    timer(1000).subscribe(() => {
    this.photos = [];
    for (let place in this.places) {
      const httpOptions = {
        responseType: 'blob' as 'blob'
      };
      this.http.get(`https://desolate-forest-23640.herokuapp.com/https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${this.places[place]['photos'][0]['photo_reference']}&key=${process.env.GOOGLE_MAPS_API_KEY}`, httpOptions).subscribe((response) => {
        var imageUrl = window.URL.createObjectURL(response);
        let images = Array.from(document.getElementsByClassName('waypoint-image') as HTMLCollectionOf<HTMLImageElement>);
        images[place].src = imageUrl;
      }, (err) => {
        this.photos.push('');
      });

    }
    });

  }

}
