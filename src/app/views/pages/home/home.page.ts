import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon, IonButton, IonRouterLink } from '@ionic/angular/standalone';
import { LocationService } from 'src/app/core/services/location-service';
import { Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [ 
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    CommonModule,
],
})

export class HomePage {

  step: 'intro' | 'explanation' | 'onboarding' = 'intro';
  navigation_allowed: boolean = false;
  
  constructor(
    private locationService: LocationService,
    public router: Router
  ) {
    // Icons are now preloaded in AppComponent
  }

  setStep(step: 'intro' | 'explanation' | 'onboarding') {
    this.step = step;
  }

  checkNavigationAllowed(allowed: boolean) {
    this.locationService.requestLocationPermission().then((allowed) => {
      this.navigation_allowed = allowed;
    });
  }

  navigateToMap() {
    this.router.navigate(['/map']);
  }
}
