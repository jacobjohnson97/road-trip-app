import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss'],
})
export class MyTripsComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    // http get trips
  }

  trips : any[] = [{name: 'Trip 1'}, {name: 'Trip 2'}];

  async closeModal() {
    await this.modalController.dismiss();
  }

}
