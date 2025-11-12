import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationComponent } from '../notfication/notfication.component';
import { NotificationService, ActiveNotification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-container',
  template: `
    <div class="notifications-container">
      <app-notification
        *ngFor="let notification of notifications"
        [config]="notification"
        [visible]="true"
        (dismissed)="onNotificationDismissed(notification.id)"
        (actionClicked)="onNotificationAction(notification.id)">
      </app-notification>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      pointer-events: none;
    }

    .notifications-container > * {
      pointer-events: auto;
    }

    /* Stack notifications with slight offset */
    app-notification:nth-child(n+2) {
      transform: translateY(calc(var(--notification-height, 80px) * (var(--index, 1) - 1) + 8px * var(--index, 1)));
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    NotificationComponent
  ]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: ActiveNotification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onNotificationDismissed(id: string) {
    this.notificationService.dismiss(id);
  }

  onNotificationAction(id: string) {
    // Action is already handled by the notification component
    // This is just for cleanup if needed
  }
}