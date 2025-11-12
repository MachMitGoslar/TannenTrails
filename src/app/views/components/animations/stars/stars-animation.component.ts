import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';

import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-stars-animation',
  templateUrl: './stars-animation.component.html',
  styleUrls: ['./stars-animation.component.scss'],
  imports: [IonIcon, CommonModule]
})
export class StarsAnimationComponent  implements OnInit {

  showStars: boolean = false;
  stars: Array<{id: number, style: any}> = [];
  @Input() animate: boolean = false;
  @Output() animation_done = new EventEmitter<boolean>();

  constructor() {

  }

  ngOnChanges() {
    if (this.animate) {
      console.log("Playing star animation");
      this.showStars = true
      this.playSuccessAnimation();
    }
  }

  ngOnInit() {
  }

  playSuccessAnimation() {
    // Create golden stars
    this.createStarExplosion();
    
    // Show stars animation
    this.showStars = true;
    
    // Hide question card after 1.5 seconds
    setTimeout(() => {
      this.animation_done.emit(true);
    }, 1500);
    
    // Hide stars after animation completes
    setTimeout(() => {
      this.showStars = false;
      this.stars = [];
    }, 3000);
  }

  private createStarExplosion() {
    const numberOfStars = 18;
    this.stars = [];
    
    for (let i = 0; i < numberOfStars; i++) {
      const angle = (360 / numberOfStars) * i;
      const distance = Math.random() * 150 + 100; // Random distance between 100-250px
      const delay = Math.random() * 0.3; // Random delay up to 0.3s
      const size = Math.random() * 1.5 + 2; // Random size between 1-2.5rem
      
      // Convert angle to radians for calculations
      const angleRad = (angle * Math.PI) / 180;
      const finalX = Math.cos(angleRad) * distance;
      const finalY = Math.sin(angleRad) * distance;
      
      const star = {
        id: i,
        style: {
          'font-size': `${size}rem`,
          'filter': `drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) hue-rotate(${Math.random() * 60 - 30}deg)`,
          '--final-x': `${finalX}px`,
          '--final-y': `${finalY}px`,
          '--rotation': `${360 + Math.random() * 180}deg`
        }
      };
      this.stars.push(star);
    }
  }

}
