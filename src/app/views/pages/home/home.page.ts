import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonRouterLink,
  IonGrid,
  IonCol,
  IonRow,
  IonItem,
  IonRadio,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
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
    IonList,
    IonLabel,
    IonRadio,
    IonItem,
    IonRow,
    IonCol,
    IonGrid,
    IonIcon,
    IonContent,
    IonIcon,
    CommonModule,
  ],
})
export class HomePage {
  acknowledgedRules = [false, false, false];

  step: 'intro' | 'explanation' | 'onboarding' = 'intro';
  navigation_allowed: Observable<boolean> = of(false);

  private locationService = inject(LocationService);
  public router = inject(Router);
  public notificationService = inject(NotificationService);

  constructor() {
    // Icons are now preloaded in AppComponent
  }

  setStep(step: 'intro' | 'explanation' | 'onboarding') {
    this.step = step;
  }

  checkNavigationAllowed() {
    this.navigation_allowed = this.locationService.checkPermissionStatus();
  }

  navigateToMap() {
    this.router.navigate(['/map']);
  }

  acknowledgeRule(index: number) {
    this.acknowledgedRules[index] = true;
  }

  allRulesAcknowledged(): boolean {
    return this.acknowledgedRules.every(ack => ack);
  }
}
