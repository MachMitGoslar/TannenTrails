import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationConfig, NotificationType } from '../../views/components/notfication/notfication.component';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from './location-service';

export interface ActiveNotification extends NotificationConfig {
  id: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<ActiveNotification[]>([]);
  private idCounter = 0;

  public notifications$: Observable<ActiveNotification[]> = this.notificationsSubject.asObservable();

  constructor(private locationService: LocationService) { }

  /**
   * Show a success notification
   */
  showSuccess(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration: 4000,
      showCloseButton: true,
      ...options
    });
  }

  /**
   * Show a warning notification
   */
  showWarning(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration: 6000,
      showCloseButton: true,
      ...options
    });
  }

  /**
   * Show an error notification
   */
  showError(title: string, message: string, options?: Partial<NotificationConfig>): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 0, // Persistent by default
      showCloseButton: true,
      ...options
    });
  }

  /**
   * Show a custom notification
   */
  show(config: NotificationConfig): string {
    const id = this.generateId();
    const notification: ActiveNotification = {
      ...config,
      id,
      timestamp: Date.now()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remove if duration is set
    if (config.duration && config.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, config.duration);
    }

    return id;
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Get current notifications
   */
  getNotifications(): ActiveNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Quick notification methods for common use cases
   */
  
  // Station completed successfully
  stationCompleted(stationNumber: number): string {
    return this.showSuccess(
      'Station abgeschlossen!',
      `Du hast Station ${stationNumber} erfolgreich abgeschlossen.`,
      { duration: 3000 }
    );
  }

  // Location reached
  locationReached(stationName: string): string {
    return this.showSuccess(
      'Standort erreicht!',
      `Du bist bei "${stationName}" angekommen.`,
      { duration: 3000 }
    );
  }

  // GPS not available
  gpsUnavailable(): string {
    return this.showWarning(
      'GPS nicht verfügbar',
      'Bitte aktiviere die Standortdienste, um den TannenTrail optimal zu nutzen.',
      { 
        duration: 0,
        actionButton: {
          text: 'Einstellungen',
          handler: () => {
            this.locationService.checkPermissionStatus();
          }
        }
      }
    );
  }

  // Network error
  networkError(): string {
    return this.showError(
      'Netzwerkfehler',
      'Überprüfe deine Internetverbindung und versuche es erneut.',
      {
        actionButton: {
          text: 'Erneut versuchen',
          handler: () => {
            // Retry logic
          }
        }
      }
    );
  }

  // Quest completed
  questCompleted(): string {
    return this.showSuccess(
      'TannenTrail abgeschlossen! 🎉',
      'Herzlichen Glückwunsch! Du hast alle Stationen erfolgreich gemeistert.',
      { duration: 8000 }
    );
  }

  private generateId(): string {
    return `notification_${++this.idCounter}_${Date.now()}`;
  }
}