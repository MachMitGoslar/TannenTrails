import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonRippleEffect,
  AnimationController,
  Animation
} from '@ionic/angular/standalone';

import { doc } from '@angular/fire/firestore';

export type NotificationType = 'success' | 'warning' | 'error';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persistent
  showCloseButton?: boolean;
  actionButton?: {
    text: string;
    handler: () => void;
  };
}

@Component({
  selector: 'app-notification',
  templateUrl: './notfication.component.html',
  styleUrls: ['./notfication.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonRippleEffect
  ]
})
export class NotificationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() config!: NotificationConfig;
  @Input() visible: boolean = false;
  @Output() dismissed = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<void>();

  private autoHideTimer?: number;
  private animation?: Animation;

  constructor(private animationCtrl: AnimationController) {
    // Icons are now preloaded in AppComponent
  }

  ngOnInit() {
    if (this.config?.duration && this.config.duration > 0) {
      this.startAutoHideTimer();
    }
  }

  ngOnChanges() {
    if (this.visible) {
      this.playEnterAnimation();
      if (this.config?.duration && this.config.duration > 0) {
        this.startAutoHideTimer();
      }
    }
  }

  ngOnDestroy() {
    this.clearAutoHideTimer();
    if (this.animation) {
      this.animation.destroy();
    }
  }

  get iconName(): string {
    switch (this.config?.type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  }

  get typeClass(): string {
    return `notification-${this.config?.type || 'success'}`;
  }

  dismiss() {
    this.clearAutoHideTimer();
    this.playExitAnimation().then(() => {
      this.visible = false;
      this.dismissed.emit();
    });
  }

  onActionClick() {
    this.actionClicked.emit();
    if (this.config?.actionButton?.handler) {
      this.config.actionButton.handler();
    }
  }

  private startAutoHideTimer() {
    this.clearAutoHideTimer();
    this.autoHideTimer = window.setTimeout(() => {
      this.dismiss();
    }, this.config.duration);
  }

  private clearAutoHideTimer() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = undefined;
    }
  }

  private async playEnterAnimation(): Promise<void> {
    setTimeout(async() => {
          const element = document.querySelector('.notification-container');
    if (!element) return;

    this.animation = this.animationCtrl
      .create()
      .addElement(element)
      .duration(300)
      .easing('ease-out')
      .fromTo('transform', 'translateY(-100%)', 'translateY(0)')
      .fromTo('opacity', '0', '1');

    await this.animation.play();
    }, 100);

  }

  private async playExitAnimation(): Promise<void> {
    const element = document.querySelector('.notification-container');
    if (!element) return;

    this.animation = this.animationCtrl
      .create()
      .addElement(element)
      .duration(250)
      .easing('ease-in')
      .fromTo('transform', 'translateY(0)', 'translateY(-100%)')
      .fromTo('opacity', '1', '0');

    await this.animation.play();
  }
}
