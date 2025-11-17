import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationComponent } from './views/components/notfication/notfication.component';
import { NotificationContainerComponent } from './views/components/notification-container/notification-container.component';
import { addIcons } from 'ionicons';
import {
  // Navigation icons
  caretForwardCircleOutline,
  arrowForwardCircle,
  arrowForwardOutline,

  // Action icons
  checkmark,
  checkmarkCircle,
  checkmarkCircleOutline,
  close,
  closeCircle,
  refresh,

  // Information icons
  informationCircle,
  informationCircleOutline,
  helpCircleOutline,
  warning,

  // Nature/Forest icons
  leafOutline,
  pawOutline,
  trashOutline,
  star,

  // Location/Navigation icons
  compassOutline,
  navigate,
  homeOutline,

  // Achievement icons
  trophy,
  trophyOutline,

  // Utility icons
  add,
  ellipseOutline,
  closeCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NotificationContainerComponent],
})
export class AppComponent {
  constructor() {
    // Preload all icons used throughout the application
    this.initializeIcons();
  }

  private initializeIcons() {
    addIcons({
      // Navigation icons
      'caret-forward-circle-outline': caretForwardCircleOutline,
      'arrow-forward-circle': arrowForwardCircle,
      'arrow-forward-outline': arrowForwardOutline,

      // Action icons
      checkmark: checkmark,
      'checkmark-circle': checkmarkCircle,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'ellipse-outline': ellipseOutline,
      close: close,
      'close-circle': closeCircle,
      refresh: refresh,

      // Information icons
      'information-circle': informationCircle,
      'information-circle-outline': informationCircleOutline,
      'help-circle-outline': helpCircleOutline,
      warning: warning,

      // Nature/Forest icons
      'leaf-outline': leafOutline,
      'paw-outline': pawOutline,
      'trash-outline': trashOutline,
      star: star,

      // Location/Navigation icons
      'compass-outline': compassOutline,
      navigate: navigate,
      'home-outline': homeOutline,
      // Achievement icons
      trophy: trophy,
      'trophy-outline': trophyOutline,

      // Utility icons
      add: add,
      'close-circle-outline': closeCircleOutline,
    });
  }
}
