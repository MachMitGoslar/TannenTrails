import { inject } from '@angular/core';

import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
import { doc, FieldValue, getDoc, Timestamp } from '@firebase/firestore';

// Badge Types
export type BadgeType = 'normal' | 'tiered' | 'collection' | 'repeating';

// Base Badge Template Interface
export interface BadgeTemplateDB {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string[];
  badgeType: BadgeType;
  tierConfig?: Record<number, TierConfig> | null;
  groupConfig?: GroupConfig | null;
}

// Tier Configuration for Tiered Badges
export interface TierConfig {
  amount: number;
  imageURL?: string | undefined;
}

// Group Configuration for Collection Badges
export interface GroupConfig {
  requiredBadges: string[];
}

// User Earned Badge Interface
export interface UserEarnedBadgeDB {
  id?: string;
  userId: string;
  badgeTemplateId: string;
  badgeType: BadgeType;
  isCompleted: boolean;
  earnedAt?: Timestamp | FieldValue;
  metadata?: Record<string, any>;
  // Tiered Badge Properties
  currentProgress?: number;
  currentTier?: number;
  maxTier?: number;
  tierRequirements?: number[];
  lastProgressAt?: Timestamp;
}

export class Badge {
  public id?: string;
  public title: string;
  public description: string;
  public imageUrl: string;
  public isCompleted?: boolean;
  public earnedAt?: Date;
  public currentProgress?: number;
  public currentTier?: number;
  public maxTier?: number;
  public tierRequirements?: number[];
  public lastProgressAt?: Date;

  constructor(init?: Partial<Badge>) {
    Object.assign(this, init);
    this.title = init?.title || '';
    this.description = init?.description || '';
    this.imageUrl = init?.imageUrl || '';
  }

  static fromFirestore(documentSnapshot: DocumentSnapshot, firestore: Firestore): Promise<Badge> {
    const data = documentSnapshot.data();
    if (!data) {
      return Promise.reject('No data found in badge document');
    }

    return getDoc(doc(firestore, 'badges/' + documentSnapshot.id))
      .then(docSnap => {
        if (docSnap.exists()) {
          const badgeData = docSnap.data();

          //construct imageUrl if badge is a tiered badge
          if (
            data['badgeType'] === 'tiered' &&
            data['currentTier'] !== undefined &&
            badgeData['tierConfig']
          ) {
            const tierConfig = badgeData['tierConfig'] as Record<number, TierConfig>;
            const currentTier = data['currentTier'] as number;
            if (tierConfig[currentTier] && tierConfig[currentTier].imageURL) {
              badgeData['imageUrl'] = tierConfig[currentTier].imageURL;
            }
          }

          // Construct Badge object from badgeData
          return new Badge({
            id: docSnap.id,
            earnedAt: data['earnedAt'] ? data['earnedAt'].toDate() : new Date(),
            title: badgeData['name'] || '',
            description: badgeData['description'] || '',
            imageUrl: badgeData['imageUrl'] || '',
            isCompleted: data['isCompleted'] || true,
            currentProgress: data['currentProgress'] || 0,
            currentTier: data['currentTier'] || 0,
            maxTier: data['maxTier'] || 0,
            tierRequirements: data['tierRequirements'] || [],
            lastProgressAt: data['lastProgressAt'] ? data['lastProgressAt'].toDate() : new Date(),
          });
        } else {
          return Promise.reject('Badge Template doesnt exist');
        }
      })
      .catch(error => {
        return Promise.reject('Error fetching badge template: ' + error);
      });
  }

  getComplitionPercentage(): number {
    if (this.maxTier && this.currentTier !== undefined && this.tierRequirements) {
      const totalRequirements = this.tierRequirements.reduce((a, b) => a + b, 0);
      const completedRequirements =
        this.tierRequirements.slice(0, this.currentTier).reduce((a, b) => a + b, 0) +
        (this.currentProgress || 0);
      return (completedRequirements / totalRequirements) * 100;
    }
    return this.isCompleted ? 100 : 0;
  }
}
