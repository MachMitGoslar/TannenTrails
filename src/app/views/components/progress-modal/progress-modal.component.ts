import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonProgressBar,
  IonText,
  IonItem,
  IonInput,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close,
  trophy,
  checkmarkCircle,
  star,
  person,
  logIn,
  logOut,
  mail,
  lockClosed,
  cloudOutline,
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { AuthService, AuthError } from '../../../core/services/auth.service';
import { BadgeService } from '../../../core/services/badges.service';
import { map, Observable, Subscription } from 'rxjs';
import { GameService } from 'src/app/core/services/game-service';

@Component({
  selector: 'app-progress-modal',
  templateUrl: './progress-modal.component.html',
  styleUrls: ['./progress-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonProgressBar,
    IonText,
    IonItem,
    IonInput,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonLabel,
  ],
})
export class ProgressModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private badgeService = inject(BadgeService);
  private modalController = inject(ModalController);
  private gameService = inject(GameService);

  // Progress data
  totalStations = 10; // This should be configurable based on the actual path
  completedStations: Observable<number> = new Observable<number>();
  progressPercentage: Observable<number> = new Observable<number>();

  // User state
  isAuthenticated = false;
  userStats: any = null;
  badges: any[] = [];

  // Login form
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showLoginForm = false;

  private subscriptions: Subscription[] = [];

  isProduction = environment.production;

  constructor() {
    addIcons({
      close,
      trophy,
      checkmarkCircle,
      star,
      person,
      'log-in': logIn,
      'log-out': logOut,
      mail,
      'lock-closed': lockClosed,
      'cloud-outline': cloudOutline,
    });
  }

  ngOnInit() {
    this.setupSubscriptions();
    this.checkAuthState();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    //this.completedStations = this.gameService.solvedStation.size;
    // Subscribe to authentication state
    const authSub = this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.showLoginForm = false;
        this.loadUserData();
      } else {
        this.clearUserData();
      }
    });
    this.subscriptions.push(authSub);

    this.completedStations = this.gameService.$stations.pipe(map(stations => stations.solved.size));

    this.progressPercentage = this.completedStations.pipe(
      map(completed => this.calculateProgress(completed, this.totalStations))
    );

    // Subscribe to badges
    const badgesSub = this.badgeService.badges$.subscribe(badges => {
      this.badges = badges || [];
    });
    this.subscriptions.push(badgesSub);

    // Subscribe to user stats
    const statsSub = this.badgeService.userStats$.subscribe(stats => {
      this.userStats = stats;
    });
    this.subscriptions.push(statsSub);

    // Subscribe to loading state
    const loadingSub = this.authService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
    this.subscriptions.push(loadingSub);
  }

  private checkAuthState() {
    this.isAuthenticated = this.authService.isAuthenticated;
    if (this.isAuthenticated) {
      this.loadUserData();
    }
  }

  private loadUserData() {
    // User data will be loaded automatically through subscriptions
    // This method can be extended for additional data loading if needed
  }

  private clearUserData() {
    this.userStats = null;
    this.badges = [];
    this.completedStations = new Observable<number>();
    this.progressPercentage = new Observable<number>();
    this.email = '';
    this.password = '';
    this.errorMessage = '';
  }

  private calculateProgress(completedStations: number, totalStations: number) {
    // Use user stats to calculate progress if available
    // if (this.userStats && this.userStats.stationsVisited) {
    //   this.completedStations = this.userStats.stationsVisited;
    // } else {
    //   // Default progress calculation based on badges or other data
    //   completedStations =
    //     this.badges.length > 0 ? Math.min(this.badges.length, this.totalStations) : 0;
    // }

    return Math.round((completedStations / totalStations) * 100);
  }

  /**
   * Show login form
   */
  showLogin() {
    this.showLoginForm = true;
    this.errorMessage = '';
  }

  /**
   * Hide login form
   */
  hideLogin() {
    this.showLoginForm = false;
    this.errorMessage = '';
    this.email = '';
    this.password = '';
  }

  /**
   * Handle login form submission
   */
  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.errorMessage = '';

    try {
      await this.authService.signIn(this.email, this.password);
      // Success - will be handled by auth state subscription
    } catch (error) {
      const authError = error as AuthError;
      this.errorMessage = authError.message;
    }
  }

  /**
   * Get progress color based on completion percentage
   */
  getProgressColor(progressPercentage: number | null): string {
    if (progressPercentage === null) return 'primary';
    if (progressPercentage >= 80) return 'success';
    if (progressPercentage >= 50) return 'warning';
    return 'primary';
  }

  /**
   * Get level progress for the user
   */
  getLevelProgress(): { current: number; next: number; percentage: number } {
    if (!this.userStats) {
      return { current: 1, next: 2, percentage: 0 };
    }

    const currentLevel = Math.floor(this.userStats.totalPoints / 100) + 1;
    const currentLevelPoints = (currentLevel - 1) * 100;
    const nextLevelPoints = currentLevel * 100;
    const pointsInCurrentLevel = this.userStats.totalPoints - currentLevelPoints;
    const percentage = Math.round((pointsInCurrentLevel / 100) * 100);

    return {
      current: currentLevel,
      next: currentLevel + 1,
      percentage: Math.min(percentage, 100),
    };
  }

  logout() {
    this.authService.signOut();
  }

  /**
   * Close the modal
   */
  async closeModal() {
    await this.modalController.dismiss();
  }

  /**
   * Get badge color based on category or type
   */
  getBadgeColor(badge: any): string {
    if (!badge.category || !badge.category.length) return 'medium';

    const category = badge.category[0].toLowerCase();
    switch (category) {
      case 'nature':
        return 'success';
      case 'exploration':
        return 'primary';
      case 'knowledge':
        return 'secondary';
      case 'achievement':
        return 'warning';
      default:
        return 'medium';
    }
  }

  /**
   * Format timestamp to readable date
   */
  formatDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  }

  loginWithOICD() {
    this.authService.loginWithOICD();
  }
}
