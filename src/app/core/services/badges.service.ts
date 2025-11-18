import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  DocumentSnapshot,
  setDoc,
  doc,
} from '@angular/fire/firestore';
import { Auth, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Badge } from '../models/badge';

export interface UserStats {
  userId: string;
  totalPoints: number;
  stationsVisited: number;
  questsCompleted: number;
  questionsAnswered: number;
  achievementCount: number;
  lastActivity: Timestamp | Date;
}

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private badgesSubject = new BehaviorSubject<Badge[]>([]);
  private userStatsSubject = new BehaviorSubject<UserStats | null>(null);

  private userId: string | null = null;

  public badges$ = this.badgesSubject.asObservable();
  public userStats$ = this.userStatsSubject.asObservable();

  private readonly COLLECTIONS = {
    BADGES: 'badges',
    USER_STATS: 'users',
  };

  constructor() {
    // Listen for authentication state changes directly from Firebase Auth
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.userId = user.uid;
        this.loadUserBadges(user.uid);
      } else {
        this.userId = null;
        this.badgesSubject.next([]);
        this.userStatsSubject.next(null);
      }
    });
  }

  /**
   * Load user achievements from Firestore
   */
  private async loadUserBadges(userId: string): Promise<void> {
    try {
      console.log('Loading badges for user:', userId);
      const user_badges_ref = collection(this.firestore, `users/${userId}/badges`);
      const q = query(user_badges_ref, orderBy('timestamp', 'desc'));

      const querySnapshot = await getDocs(q);
      const badges: Badge[] = [];

      querySnapshot.forEach(async doc => {
        badges.push(await Badge.fromFirestore(doc as DocumentSnapshot, this.firestore));
      });

      this.badgesSubject.next(badges);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }

  awardBadgeToUser(badgeId: string) {
    if (!this.userId) {
      return;
    }
    const userBadgeRef = doc(this.firestore, `users/${this.userId}/badges/${badgeId}`);
    return setDoc(userBadgeRef, {
      badgeId: badgeId,
      awardedAt: Timestamp.now(),
    });
  }
}
