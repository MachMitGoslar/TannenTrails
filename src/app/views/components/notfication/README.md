# Notification Component Usage Guide

## Overview
The notification component provides a flexible way to display success, warning, and error messages throughout the TannenTrails app using Ionic components.

## Basic Usage

### 1. Import the Notification Service
```typescript
import { NotificationService } from 'src/app/core/services/notification.service';

constructor(private notificationService: NotificationService) {}
```

### 2. Show Notifications
```typescript
// Success notification
this.notificationService.showSuccess(
  'Erfolg!', 
  'Die Aktion wurde erfolgreich abgeschlossen.'
);

// Warning notification
this.notificationService.showWarning(
  'Warnung', 
  'Bitte überprüfe deine Eingaben.'
);

// Error notification
this.notificationService.showError(
  'Fehler', 
  'Es ist ein unerwarteter Fehler aufgetreten.'
);
```

### 3. Custom Notifications
```typescript
this.notificationService.show({
  type: 'success',
  title: 'Station erreicht!',
  message: 'Du hast Station 5 erfolgreich erreicht.',
  duration: 5000, // Auto-hide after 5 seconds
  showCloseButton: true,
  actionButton: {
    text: 'Weiter',
    handler: () => {
      // Navigate to next station
      this.router.navigate(['/station', 6]);
    }
  }
});
```

## Pre-built Convenience Methods

### Station Completion
```typescript
this.notificationService.stationCompleted(3);
```

### Location Reached
```typescript
this.notificationService.locationReached('Totholz als Lebensraum');
```

### GPS Issues
```typescript
this.notificationService.gpsUnavailable();
```

### Network Problems
```typescript
this.notificationService.networkError();
```

### Quest Completion
```typescript
this.notificationService.questCompleted();
```

## Configuration Options

### NotificationConfig Interface
```typescript
interface NotificationConfig {
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  showCloseButton?: boolean; // default: true
  actionButton?: {
    text: string;
    handler: () => void;
  };
}
```

### Notification Types
- **success**: Green theme with checkmark icon
- **warning**: Yellow theme with warning icon  
- **error**: Red theme with error icon

## Features

### ✅ Auto-hide Timer
- Set `duration` in milliseconds
- Shows progress bar indicating remaining time
- Set to `0` for persistent notifications

### ✅ Action Buttons
- Add custom action buttons with handlers
- Perfect for "Retry", "Settings", "Continue" actions

### ✅ Animations
- Smooth slide-in from top
- Icon bounce animation
- Hover effects for better UX

### ✅ Responsive Design
- Adapts to mobile and tablet screens
- Proper spacing and typography

### ✅ Accessibility
- High contrast mode support
- Reduced motion support
- Proper ARIA labels

### ✅ Dark Mode
- Automatic dark theme support
- Maintains readability and contrast

## Integration

### App Component
Add the notification container to your main app component:

```typescript
// app.component.html
<ion-app>
  <ion-router-outlet></ion-router-outlet>
  <app-notification-container></app-notification-container>
</ion-app>
```

### Page Examples

#### Station Page
```typescript
export class StationPage {
  constructor(private notificationService: NotificationService) {}

  onQuestionAnswered(correct: boolean) {
    if (correct) {
      this.notificationService.showSuccess(
        'Richtig!', 
        'Du hast die Frage korrekt beantwortet.'
      );
    } else {
      this.notificationService.showWarning(
        'Nicht ganz richtig', 
        'Versuche es noch einmal.'
      );
    }
  }
}
```

#### Home Page
```typescript
export class HomePage {
  constructor(private notificationService: NotificationService) {}

  onQuestStart() {
    this.notificationService.showSuccess(
      'Quest gestartet!',
      'Begib dich zur ersten Station und entdecke den TannenTrail.',
      { duration: 6000 }
    );
  }
}
```

## Best Practices

1. **Use appropriate types**: Success for completions, warnings for user attention, errors for problems
2. **Keep messages concise**: Short titles, clear messages
3. **Provide actions**: Add action buttons for common next steps
4. **Set appropriate durations**: 3-5s for success, 6-8s for warnings, persistent for errors
5. **Don't spam**: Avoid showing multiple notifications rapidly