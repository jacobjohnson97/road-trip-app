import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

enum SearchType { AREA_RADIUS, START_END };
enum DistanceUnits { MILES, KILOMETERS };

@Component({
  selector: 'app-search-card',
  templateUrl: './search-card.component.html',
  styleUrls: ['./search-card.component.scss'],
})
export class SearchCardComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  SearchType = SearchType;
  DistanceUnits = DistanceUnits;
  currentSearchType : SearchType = SearchType.AREA_RADIUS;
  currentRadius : number = 50;
  currentDistanceUnits : DistanceUnits = DistanceUnits.MILES;

  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss();
  }
}
