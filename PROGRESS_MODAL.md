# Progress Modal Component

The Progress Modal Component is a comprehensive modal that displays user progress, achievements, and badges. It adapts based on the user's authentication status.

## Features

### 🎯 **Progress Gauge**
- Circular progress gauge showing completed vs total stations
- Dynamic color coding (primary/warning/success)
- Percentage completion display
- Configurable total stations count

### 🏆 **Authenticated User Features**
- User statistics (points, level, quests completed, badges earned)
- Level progress bar with percentage to next level
- Earned badges display with categorized colors
- Achievement overview

### 🔐 **Non-Authenticated User Features**
- Login form with email/password fields
- User-friendly authentication prompts
- Error handling with clear messages

## Usage

### Opening the Modal

#### Method 1: Using ProgressModalService (Recommended)
```typescript
import { ProgressModalService } from '../core/services/progress-modal.service';

@Component({...})
export class MyComponent {
  constructor(private progressModalService: ProgressModalService) {}

  async showProgress() {
    // Open with default 10 stations
    await this.progressModalService.openProgressModal();
    
    // Or specify custom station count
    await this.progressModalService.openProgressModal(15);
  }
}
```

#### Method 2: Direct Modal Controller Usage
```typescript
import { ModalController } from '@ionic/angular/standalone';
import { ProgressModalComponent } from '../components/progress-modal/progress-modal.component';

@Component({...})
export class MyComponent {
  constructor(private modalController: ModalController) {}

  async showProgress() {
    const modal = await this.modalController.create({
      component: ProgressModalComponent,
      componentProps: {
        totalStations: 12
      },
      cssClass: 'progress-modal'
    });
    
    await modal.present();
  }
}
```

### Template Integration

#### Simple Button Example
```html
<ion-button (click)="showProgress()">
  <ion-icon name="trophy" slot="start"></ion-icon>
  View Progress
</ion-button>
```

#### Toolbar Integration
```html
<ion-header>
  <ion-toolbar>
    <ion-title>Forest Trail</ion-title>
    <ion-button slot="end" fill="clear" (click)="showProgress()">
      <ion-icon name="stats-chart"></ion-icon>
    </ion-button>
  </ion-toolbar>
</ion-header>
```

#### Floating Action Button
```html
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button (click)="showProgress()">
    <ion-icon name="trophy"></ion-icon>
  </ion-fab-button>
</ion-fab>
```

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `totalStations` | number | 10 | Total number of stations in the path |

## Modal Configuration

### CSS Classes
Add custom styling by applying CSS classes:

```typescript
const modal = await this.modalController.create({
  component: ProgressModalComponent,
  cssClass: 'progress-modal custom-modal',
  backdropDismiss: true,
  showBackdrop: true
});
```

### Custom Styling
```scss
.progress-modal {
  --height: 90%;
  --width: 95%;
  --max-width: 500px;
  --border-radius: 16px;
}

@media (min-width: 768px) {
  .progress-modal {
    --width: 60%;
  }
}
```

## Integration Examples

### Overview Component Integration
Already integrated in `overview.component.ts`:

```typescript
// In overview.component.ts
async openProgressModal() {
  try {
    await this.progressModalService.openProgressModal(StationData.length);
  } catch (error) {
    console.error('Error opening progress modal:', error);
  }
}
```

### Station Page Integration
```typescript
// In station.page.ts
import { ProgressModalService } from '../../../core/services/progress-modal.service';

export class StationPage {
  constructor(private progressModalService: ProgressModalService) {}
  
  async viewProgress() {
    await this.progressModalService.openProgressModal();
  }
}
```

### Menu Integration
```typescript
// In menu.component.ts
menuItems = [
  {
    title: 'Progress',
    icon: 'trophy',
    action: () => this.progressModalService.openProgressModal()
  },
  // other menu items...
];
```

## Authentication States

### Authenticated User View
- ✅ Progress gauge
- ✅ User statistics card
- ✅ Level progress bar
- ✅ Earned badges grid
- ✅ Achievement counts

### Non-Authenticated User View
- ✅ Progress gauge (basic)
- ✅ Sign in prompt
- ✅ Login form with validation
- ✅ Error handling

## Dependencies

### Services Used
- `AuthService` - Authentication state and login functionality
- `BadgeService` - User badges and statistics
- `ModalController` - Modal presentation

### Ionic Components
- `IonModal`, `IonHeader`, `IonToolbar`, `IonTitle`
- `IonContent`, `IonCard`, `IonProgressBar`
- `IonButton`, `IonIcon`, `IonInput`
- `IonGrid`, `IonRow`, `IonCol`
- `IonChip`, `IonSpinner`, `IonText`

## Error Handling

The component includes comprehensive error handling:

```typescript
// Login errors
catch (error) {
  const authError = error as AuthError;
  this.errorMessage = authError.message;
}

// Modal opening errors
catch (error) {
  console.error('Error opening progress modal:', error);
}
```

## Accessibility Features

- ✅ Screen reader friendly labels
- ✅ Keyboard navigation support
- ✅ High contrast support
- ✅ Proper ARIA attributes
- ✅ Focus management

## Performance Considerations

- ✅ Subscription cleanup on component destroy
- ✅ Lazy loading of badge images
- ✅ Efficient progress calculations
- ✅ Optimized for mobile devices

## Customization

### Badge Colors
Customize badge colors by category:

```scss
.badge-item {
  &.nature { --badge-color: var(--ion-color-success); }
  &.exploration { --badge-color: var(--ion-color-primary); }
  &.knowledge { --badge-color: var(--ion-color-secondary); }
  &.achievement { --badge-color: var(--ion-color-warning); }
}
```

### Progress Gauge Colors
```scss
.gauge-circle {
  background: conic-gradient(
    var(--progress-color) 0% var(--progress),
    var(--ion-color-light) var(--progress) 100%
  );
}
```

## Testing

### Unit Testing
```typescript
import { ProgressModalComponent } from './progress-modal.component';
import { ModalController } from '@ionic/angular';

describe('ProgressModalComponent', () => {
  // Test authentication states
  // Test progress calculations
  // Test badge display
  // Test login functionality
});
```

### E2E Testing
```typescript
describe('Progress Modal', () => {
  it('should open modal when progress button clicked', () => {
    cy.get('[data-cy=progress-button]').click();
    cy.get('app-progress-modal').should('be.visible');
  });
});
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+