import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';

enum SearchType { AREA_RADIUS, START_END };
enum DistanceUnits { MILES, KILOMETERS };

@Component({
  selector: 'app-search-card',
  templateUrl: './search-card.component.html',
  styleUrls: ['./search-card.component.scss'],
})
export class SearchCardComponent implements OnInit {

  constructor(private modalController: ModalController, private http: HttpClient, private toastController: ToastController) { }

  SearchType = SearchType;
  DistanceUnits = DistanceUnits;
  currentSearchType : SearchType = SearchType.AREA_RADIUS;
  awaitHttp : boolean = false;
  awaitAutocomplete : boolean = false;
  showPopoverOrigin : boolean = false;
  showPopoverDestination : boolean = false;
  shouldRequest : boolean = true;

  radiusModel : number = 50;
  minRadius : number = 50;
  maxRadius : number = 2000;
  distanceUnitsModel : DistanceUnits = DistanceUnits.MILES;
  endLocationModel : string;

  startLocationModel : string;
  stopsModel : number = 1;
  minStops : number = 1;
  maxStops : number = 20;
  filtersModel : string[] = [];

  locationFilters : any[] = ['Amusement Park', 'Aquarium', 'Art Gallery', 'Bakery', 'Bar', 'Book Store', 'Bowling Alley', 'Cafe', 'Campground', 'Casino', 'Library', 'Movie Theater', 'Museum', 'Night Club', 'Park', 'University', 'Zoo'];
  properFilters : any[] = ['amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bar', 'book_store', 'bowling_alley', 'cafe', 'campground', 'casino', 'library', 'movie_theater', 'museum', 'night_club', 'park', 'university', 'zoo'];
  autoCompleteOptionsOrigin : string[] = [];
  autoCompleteOptionsDestination : string[] = [];

  autoCompleteCounter : number = 0;

  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss('{}');
  }

  placeAutocompleteOrigin(text : string) {
    if (this.shouldRequest) {
      this.awaitAutocomplete = true;
      this.autoCompleteCounter++;
      let counter = this.autoCompleteCounter;
      timer(1000).subscribe(() => {
        if (counter == this.autoCompleteCounter) {
          //https://cors-anywhere.herokuapp.com/
          this.http.get(`https://desolate-forest-23640.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${process.env.GOOGLE_MAPS_API_KEY}&components=country:us&types=(cities)`).subscribe((response) => {
            this.awaitAutocomplete = false;  
            this.autoCompleteOptionsOrigin = [];
            for (let i = 0; i < response['predictions'].length; i++) {
              this.autoCompleteOptionsOrigin.push(response['predictions'][i]['description']);
            }
          }, (err) => {
            this.awaitAutocomplete = false;
            console.log(err)
          }); 
        }
      });
    }
    this.shouldRequest = true;
  }

  placeAutocompleteDestination(text : string) {
    if (this.shouldRequest) {
      this.awaitAutocomplete = true;
      this.autoCompleteCounter++;
      let counter = this.autoCompleteCounter;
      timer(1000).subscribe(() => {
        if (counter == this.autoCompleteCounter) {
          //https://cors-anywhere.herokuapp.com/
          this.http.get(`https://desolate-forest-23640.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${process.env.GOOGLE_MAPS_API_KEY}&components=country:us&types=(cities)`).subscribe((response) => {
            this.awaitAutocomplete = false;  
            this.autoCompleteOptionsDestination = [];
            for (let i = 0; i < response['predictions'].length; i++) {
              this.autoCompleteOptionsDestination.push(response['predictions'][i]['description']);
            }
          }, (err) => {
            this.awaitAutocomplete = false;
            console.log(err)
          }); 
        }
      });
    }
    this.shouldRequest = true;
  }

  selectOptionOrigin(option : string) {
    this.shouldRequest = false;
    this.startLocationModel = option;
    this.showPopoverOrigin = false;
  }

  selectOptionDestination(option : string) {
    this.shouldRequest = false;
    this.endLocationModel = option;
    this.showPopoverDestination = false;
  }

  getTrip() {
    this.awaitHttp = true;
    let request : string;
    if (this.currentSearchType == SearchType.AREA_RADIUS) {
      request = `https://localhost:3000/api/v1/trips/calculatetrip?origin=${this.startLocationModel}&radius=${this.radiusModel}&num_waypoints=${this.stopsModel}&types=${this.getFilterTypes()}`;
      if (this.validateRadius()) {
        this.makeRequest(request, SearchType.AREA_RADIUS);
      } else {
        this.dangerToast('Invalid fields');
      }
    } else {
      request = `https://localhost:3000/api/v1/trips/calculatetrip?origin=${this.startLocationModel}&destination=${this.endLocationModel}&num_waypoints=${this.stopsModel}&types=${this.getFilterTypes()}`;
      console.log(request)
      if (this.validateStartEnd()) {
        this.makeRequest(request, SearchType.START_END);
      } else {
        this.dangerToast('Invalid fields');
      }
    }
  }

  makeRequest(request : string, searchType : SearchType) {
    this.http.get(request).subscribe((response) => {
      this.awaitHttp = false;  
      if (response['waypoints'].length == 0 && searchType == SearchType.START_END){
        this.dangerToast('No waypoints were found to match this search. Please try again');
      } else {
        this.modalController.dismiss(JSON.stringify(response));
      }
    }, (err) => {
      this.awaitHttp = false;
      this.dangerToast('Something went wrong. Please try again later.');
    });
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

  validateStartEnd() {
    return this.endLocationModel && this.validateWaypointFilters();
  }

  validateRadius() {
    return this.radiusModel >= this.minRadius && this.radiusModel <= this.maxRadius && this.validateWaypointFilters();
  }

  validateWaypointFilters() {
    let filters : string[] = []
    for (let filter of this.filtersModel) {
      if (this.properFilters.indexOf(filter) < 0) {
        return false;
      }
      if (filters.indexOf(filter) > -1) {
        return false;
      }
      filters.push(filter);
    }
    return this.startLocationModel && this.stopsModel >= this.minStops && this.stopsModel <= this.maxStops;
  }

  getFilterTypes() {
    let types = '';
    for (let filter of this.filtersModel) {
      types += filter + ',';
    }
    types = types.substring(0, types.length - 1);
    return types;
  }
}
