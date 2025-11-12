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
import { NotificationService } from 'src/app/core/services/notification.service';
import { from, Observable, of } from 'rxjs';

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
  navigation_allowed: Observable<boolean> = of(false);
  
  constructor(
    private locationService: LocationService,
    public router: Router,
    public notificationService: NotificationService
  ) {
    // Icons are now preloaded in AppComponent
  }

  setStep(step: 'intro' | 'explanation' | 'onboarding') {
    this.step = step;
  }

  checkNavigationAllowed() {
    this.navigation_allowed = this.locationService.checkPermissionStatus()
  }

  navigateToMap() {
    this.router.navigate(['/map']);
  }
}
