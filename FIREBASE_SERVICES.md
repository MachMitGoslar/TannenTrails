# Firebase Services Documentation

## Overview
This document describes the Firebase authentication and achievements services implemented for the TannenTails app.

## Services Created

### 1. AuthService (`auth.service.ts`)
Handles user authentication and profile management.

#### Features:
- User registration with email/password
- User sign-in with email/password  
- Password reset functionality
- User profile management
- Real-time authentication state tracking
- Comprehensive error handling

#### Usage Examples:

```typescript
// In any component
constructor(private authService: AuthService) {}

// Register a new user
try {
  await this.authService.register('user@example.com', 'password123', 'John Doe');
  console.log('Registration successful!');
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Sign in existing user
try {
  await this.authService.signIn('user@example.com', 'password123');
  console.log('Sign in successful!');
} catch (error) {
  console.error('Sign in failed:', error.message);
}

// Check authentication state
this.authService.user$.subscribe(user => {
  if (user) {
    console.log('User is signed in:', user.email);
  } else {
    console.log('User is signed out');
  }
});

// Get current user profile
const profile = this.authService.userProfile;
console.log('User ID:', profile?.uid);
console.log('Email:', profile?.email);
```

### 2. AchievementsService (`achievements.service.ts`)
Handles Firestore operations for tracking user achievements and statistics.

#### Features:
- Record various types of achievements
- Track user statistics (points, level, badges)
- Real-time achievement updates
- Station visit tracking
- Quest completion tracking
- Question answer tracking
- Path completion tracking

#### Usage Examples:

```typescript
// In any component
constructor(private achievementsService: AchievementsService) {}

// Record station visit
try {
  await this.achievementsService.recordStationVisit(
    'station_001', 
    'Forest Entrance',
    { latitude: 51.9039, longitude: 10.4169 }
  );
  console.log('Station visit recorded!');
} catch (error) {
  console.error('Error recording station visit:', error);
}

// Record quest completion
try {
  await this.achievementsService.recordQuestCompletion(
    'station_001',
    'Forest Entrance', 
    'quest_001',
    'Tree Identification',
    300 // time spent in seconds
  );
  console.log('Quest completion recorded!');
} catch (error) {
  console.error('Error recording quest completion:', error);
}

// Record question answer
try {
  await this.achievementsService.recordQuestionAnswer(
    'station_001',
    'Forest Entrance',
    'quest_001', 
    'Tree Identification',
    2, // number of attempts
    true // was answer correct
  );
  console.log('Question answer recorded!');
} catch (error) {
  console.error('Error recording question answer:', error);
}

// Subscribe to user achievements
this.achievementsService.achievements$.subscribe(achievements => {
  console.log('User achievements:', achievements);
  console.log('Total achievements:', achievements.length);
});

// Subscribe to user statistics
this.achievementsService.userStats$.subscribe(stats => {
  if (stats) {
    console.log('Total points:', stats.totalPoints);
    console.log('Level:', stats.level);
    console.log('Stations visited:', stats.stationsVisited);
    console.log('Quests completed:', stats.questsCompleted);
  }
});

// Check if user has visited a station
this.achievementsService.hasVisitedStation('station_001').subscribe(hasVisited => {
  console.log('Has visited station:', hasVisited);
});
```

## Data Models

### Achievement Interface
```typescript
interface Achievement {
  id?: string;
  userId: string;
  stationId: string;
  stationName: string;
  questId?: string;
  questName?: string;
  type: 'station_visited' | 'quest_completed' | 'question_answered' | 'path_completed';
  points: number;
  timestamp: Timestamp | Date;
  metadata?: {
    accuracy?: number;
    timeSpent?: number;
    attempts?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    [key: string]: any;
  };
}
```

### UserStats Interface
```typescript
interface UserStats {
  userId: string;
  totalPoints: number;
  stationsVisited: number;
  questsCompleted: number;
  questionsAnswered: number;
  pathsCompleted: number;
  achievementCount: number;
  lastActivity: Timestamp | Date;
  level: number;
  badges: string[];
}
```

## Firestore Collections

### `achievements` Collection
Stores individual achievement records for all users.

Document structure:
```json
{
  "userId": "user_123",
  "stationId": "station_001",
  "stationName": "Forest Entrance",
  "questId": "quest_001",
  "questName": "Tree Identification",
  "type": "quest_completed",
  "points": 50,
  "timestamp": "2025-11-17T10:30:00Z",
  "metadata": {
    "timeSpent": 300,
    "coordinates": {
      "latitude": 51.9039,
      "longitude": 10.4169
    }
  }
}
```

### `userStats` Collection
Stores aggregated statistics for each user.

Document ID: `{userId}`
Document structure:
```json
{
  "totalPoints": 150,
  "stationsVisited": 3,
  "questsCompleted": 2,
  "questionsAnswered": 5,
  "pathsCompleted": 0,
  "achievementCount": 8,
  "lastActivity": "2025-11-17T10:30:00Z",
  "level": 2,
  "badges": ["first_station", "quest_master"]
}
```

## Points System

- **Station Visit**: 10 points
- **Question Answered (Correct)**: 20 points (first try), 10 points (multiple tries)
- **Quest Completed**: 50 points
- **Path Completed**: (stations × 10) + 100 bonus points

## Level System

- **Level Calculation**: Level = floor(totalPoints / 100) + 1
- **Points to Next Level**: nextLevelPoints - currentPoints

## Integration with Existing App

### In Station Component
```typescript
async onStationEntered(station: Station) {
  // Record station visit when user enters station radius
  try {
    await this.achievementsService.recordStationVisit(
      station.id,
      station.name,
      { latitude: station.lat, longitude: station.lng }
    );
  } catch (error) {
    console.error('Error recording station visit:', error);
  }
}
```

### In Question Component
```typescript
async onAnswerSubmitted(isCorrect: boolean, attempts: number) {
  try {
    await this.achievementsService.recordQuestionAnswer(
      this.stationId,
      this.stationName,
      this.questId,
      this.questName,
      attempts,
      isCorrect
    );
  } catch (error) {
    console.error('Error recording answer:', error);
  }
}
```

## Security Rules (Firestore)

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own achievements
    match /achievements/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Users can only read/write their own stats
    match /userStats/{userId} {
      allow read, write: if request.auth != null && 
        userId == request.auth.uid;
    }
  }
}
```

## Error Handling

Both services include comprehensive error handling:

- Network connectivity issues
- Authentication failures
- Firestore permission errors
- Invalid data validation
- User-friendly error messages

## Testing

Use the `AuthPage` component (`/auth`) to test the authentication flow and achievements system.