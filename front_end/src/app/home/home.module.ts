import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { SearchCardComponent } from '../search-card/search-card.component';
import { LoginCardComponent } from '../login-card/login-card.component';
import { MyTripsComponent } from '../my-trips/my-trips.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage, SearchCardComponent, LoginCardComponent, MyTripsComponent],
  entryComponents: [SearchCardComponent, LoginCardComponent, MyTripsComponent]
})
export class HomePageModule {}
