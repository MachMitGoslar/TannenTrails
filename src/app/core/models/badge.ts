import { inject } from '@angular/core';

import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
import { doc, FieldValue, getDoc, Timestamp } from '@firebase/firestore';

// Badge Types
export type BadgeType = 'normal' | 'tiered' | 'collection' | 'repeating';

// Tier Configuration for Tiered Badges
export interface TierConfig {
  amount: number;
  imageURL?: string | undefined;
}

// Group Configuration for Collection Badges
export interface GroupConfig {
  requiredBadges: string[];
}

export class Badge {
  public id?: string;
  public title: string;
  public text_awarded: string;
  public text_condition: string;
  public imageUrl: string;
  public isCompleted?: boolean;
  public earnedAt?: Date;
  public currentProgress?: number;
  public currentTier?: number;
  public maxTier?: TierConfig;
  public tierRequirements?: Map<number, TierConfig>;
  public lastProgressAt?: Date;

  constructor(init?: Partial<Badge>) {
    Object.assign(this, init);
    this.title = init?.title || '';
    this.text_awarded = init?.text_awarded || '';
    this.text_condition = init?.text_condition || '';
    this.imageUrl = init?.imageUrl || '';
  }

  static fromFirestore(documentSnapshot: DocumentSnapshot, firestore: Firestore): Promise<Badge> {
    const data = documentSnapshot.data();
    if (!data) {
      return Promise.reject('No data found in badge document');
    }

    return getDoc(doc(firestore, 'badgeTemplates/' + documentSnapshot.id))
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
            //Get config for max tier
            const maxTier = tierConfig[Object.keys(tierConfig).length];
            data['maxTier'] = maxTier;
          }

          // Construct Badge object from badgeData
          return new Badge({
            id: docSnap.id,
            earnedAt: data['earnedAt'] ? data['earnedAt'].toDate() : new Date(),
            title: badgeData['name'] || '',
            text_awarded: badgeData['text_awarded'] || '',
            text_condition: badgeData['text_condition'] || '',
            imageUrl: badgeData['imageUrl'] || '',
            isCompleted: data['isCompleted'] || true,
            currentProgress: data['currentProgress'] || 0,
            currentTier: data['currentTier'] || 0,
            maxTier: data['maxTier'] || 0,
            tierRequirements: data['tierConfig'] || [],
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
    if (this.maxTier && this.currentProgress) {
      return (this.currentProgress / this.maxTier.amount) * 100;
    }
    return 0;
  }
}
