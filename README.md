# 🌲 TannenTails - Walderlebnispfad Goslar

<div align="center">

![TannenTails Logo](src/assets/logos/Stadtforst%20Goslar_Logo_Aller_Slogan_Negativ_ohne%20Subline.png)

**Eine interaktive mobile App für den Walderlebnispfad in Goslar**

[![Ionic](https://img.shields.io/badge/Ionic-8.0.0-3880FF?style=for-the-badge&logo=ionic)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-20.0.0-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4.4-119EFF?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)

</div>

## 📱 Über die App

TannenTails ist eine moderne, interaktive mobile Anwendung, die Besucher durch den Walderlebnispfad in Goslar führt. Mit GPS-Navigation, interaktiven Karten und spannenden Rätseln wird der Waldspaziergang zu einem unvergesslichen Abenteuer.

### 🦊 Funktionen

- **🗺️ Interaktive Karte** - Leaflet-basierte Karte mit GPS-Navigation
- **📍 Standort-basierte Stationen** - Automatische Erkennung von Waldstationen
- **🧩 Interaktive Rätsel** - Multiple Choice, True/False und Schätzfragen
- **🌟 Erfolgs-Animationen** - Belohnungen mit goldenen Sternen-Explosionen
- **📱 Cross-Platform** - Läuft auf Web, iOS und Android
- **🎨 Modernes Design** - Glass Morphism und handschriftliche Effekte
- **🔔 Smart Notifications** - Informative Benachrichtigungen
- **♿ Accessibility** - Unterstützt Barrierefreiheit

## 🚀 Tech Stack

### Frontend Framework
- **[Ionic 8](https://ionicframework.com/)** - Cross-platform mobile framework
- **[Angular 20](https://angular.io/)** - Modern web framework
- **[Standalone Components](https://angular.io/guide/standalone-components)** - Latest Angular pattern

### Mapping & Location
- **[Leaflet](https://leafletjs.com/)** - Interactive maps
- **[Capacitor Geolocation](https://capacitorjs.com/docs/apis/geolocation)** - GPS functionality
- **[Geolocation Utils](https://www.npmjs.com/package/geolocation-utils)** - Distance calculations

### Styling & Animation
- **SCSS** - Advanced styling
- **CSS Animations** - Custom animations and transitions
- **Glass Morphism** - Modern UI design trend
- **Google Fonts (Kalam)** - Handwritten typography

### Development Tools
- **TypeScript** - Type-safe development
- **ESLint** - Code linting
- **Karma & Jasmine** - Testing framework
- **GitHub Actions** - CI/CD pipeline

## 🏗️ Projektstruktur

```
TannenTails/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services and models
│   │   │   ├── models/              # Data models
│   │   │   │   ├── dataset.ts       # Static trail data (stations, path, questions)
│   │   │   │   ├── station.model.ts
│   │   │   │   ├── badge.ts
│   │   │   │   └── questions.model.ts
│   │   │   └── services/            # Business logic services
│   │   │       ├── game-service.ts
│   │   │       ├── location-service.ts
│   │   │       ├── auth.service.ts
│   │   │       ├── badges.service.ts
│   │   │       └── notification.service.ts
│   │   ├── views/                   # UI components and pages
│   │   │   ├── components/          # Reusable components
│   │   │   │   ├── animations/
│   │   │   │   │   └── stars/       # Star explosion animation
│   │   │   │   ├── notification/    # Notification system
│   │   │   │   ├── overview/        # Map overview
│   │   │   │   └── question-card/   # Interactive questions
│   │   │   └── pages/               # Application pages
│   │   │       ├── home/            # Onboarding and intro
│   │   │       └── station/         # Station details
│   │   └── app.component.ts         # Root component with icon preloading
│   ├── assets/                      # Static assets
│   │   ├── data/                    # JSON data files
│   │   ├── icons/                   # App icons
│   │   ├── logos/                   # Logos and branding
│   │   ├── map/                     # Map-related assets
│   │   └── stations/                # Station-specific content
│   └── theme/                       # Global styling
├── .github/                         # GitHub workflows and templates
│   ├── workflows/                   # CI/CD pipelines
│   │   ├── pr-main.yml             # Pull request workflow
│   │   └── create-labels.yml       # Auto-label creation
│   └── PULL_REQUEST_TEMPLATE/       # PR templates
└── capacitor.config.ts              # Capacitor configuration
```

## 🛠️ Installation & Setup

### Voraussetzungen

- **Node.js** (v18 oder höher)
- **npm** oder **yarn**
- **Ionic CLI** (`npm install -g @ionic/cli`)
- **Capacitor CLI** (wird automatisch installiert)

### 1. Repository klonen

```bash
git clone https://github.com/your-username/TannenTails.git
cd TannenTails
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Entwicklungsserver starten

```bash
ionic serve
```

Die App ist nun unter `http://localhost:8100` verfügbar.

## 📱 Platform-spezifische Builds

### Web Build
```bash
ionic build --prod
```

### Android Build
```bash
ionic cap add android
ionic cap sync android
ionic cap open android
```

### iOS Build
```bash
ionic cap add ios
ionic cap sync ios
ionic cap open ios
```

## 🧪 Testing

### Unit Tests ausführen
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 🎨 Design Features

### Glass Morphism UI
- Transparente Karten mit Backdrop-Filter
- Subtile Schatten und Glanzeffekte
- Moderne, luftige Optik

### Handschriftliche Effekte
- Google Font "Kalam" für natürliche Handschrift
- Typewriter-Animationen (programmierbar steuerbar)
- Ink-Flow Effekte bei Texterscheinung

### Erfolgs-Animationen
- Goldene Sterne-Explosionen bei richtigen Antworten
- GPU-beschleunigte Animationen
- Responsives Design für alle Bildschirmgrößen

## 🗺️ Karten & Navigation

### Leaflet Integration
- Interaktive Karten mit Zoom und Pan
- Custom Marker für Waldstationen
- GPX-Pfad Import und Anzeige
- Verschiedene Kartenprovider

### GPS & Standorterkennung
- Native Geolocation API (Web)
- Capacitor Geolocation (Mobile)
- Standort-basierte Station Detection (25 m Radius)
- Intelligente Permissions-Verwaltung
- **GPS Mock Mode** — `LocationService.watchPosition(true)` spielt die aufgezeichneten Pfad-Koordinaten ab (1 s Takt), um den Trail ohne physische Bewegung zu testen

## 🔔 Notification System

### Smart Notifications
- Drei Typen: Success, Warning, Error
- Animierte Ein-/Ausblendungen
- Auto-Hide Timer
- Custom Aktionen

### Standort-basierte Benachrichtigungen
- Automatische Benachrichtigung beim Erreichen einer Station
- Kontextuell relevante Informationen
- Respekt für Nutzer-Präferenzen

## 🎯 Station System

### Interaktive Stationen
- Multiple Choice Fragen
- Externe Aufgaben (Foto posten, etc.)
- Sofortiges visuelles Feedback

### Fortschritts-Tracking
- Besuchte Stationen merken
- Erfolgreiche Antworten speichern
- Gesamtfortschritt anzeigen

## Firebase & Backend

### Authentication
- **Firebase Auth** — E-Mail/Passwort sowie OIDC via **Goslar-ID** (`oidc.goslar_id`)
- `AuthService` wraps alle Auth-Operationen mit Fehlerbehandlung

### Firestore Datenstruktur
```
users/{uid}/badges/          # Verdiente Badges des Nutzers
badgeTemplates/{badgeId}/    # Badge-Vorlagen (Titel, Bild, Text)
```

### Badge System
- `BadgeService` lädt Badges nach Login automatisch
- Jede Station hat eine optionale `badgeId`, die nach dem Lösen vergeben wird
- `Badge.fromFirestore()` verknüpft User-Badge-Daten mit dem Template

## 🔧 Konfiguration

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  googleMapsApiKey: '...',
  firebaseConfig: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
    databaseId: 'bridge',
  },
};
```

Do not commit real API keys. Replace values with your own Firebase project credentials.

### Capacitor Config
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.tannentails.app',
  appName: 'TannenTails',
  webDir: 'dist',
  plugins: {
    Geolocation: {
      permissions: ['location']
    }
  }
};
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflows
- **Pull Request Checks** - Code quality, tests, builds
- **Automatic Labeling** - Smart PR categorization
- **Bundle Size Analysis** - Performance monitoring
- **Security Audits** - Dependency scanning

### Code Quality Gates
- ESLint validation
- TypeScript type checking
- Unit test coverage
- Build verification

## 📈 Performance

### Optimierungen
- Lazy Loading für Komponenten
- OnPush Change Detection
- Optimierte Bundle Size
- Service Worker für Caching

### Monitoring
- Bundle Size Tracking
- Performance Metrics
- Memory Leak Prevention

## 🤝 Beitrag leisten

### Pull Request Workflow
1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

### Code Standards
- Befolge die ESLint Regeln
- Verwende TypeScript Types
- Schreibe aussagekräftige Commit Messages
- Füge Tests für neue Features hinzu

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe [LICENSE](LICENSE) Datei für Details.

## 👥 Team

- **Entwicklung** - [Dein Name](https://github.com/your-username)
- **Design** - Stadtforst Goslar
- **Konzept** - Walderlebnispfad Goslar

## 🙏 Danksagungen

- **Ionic Team** - Für das fantastische Framework
- **Angular Team** - Für die solide Basis
- **Stadtforst Goslar** - Für die Zusammenarbeit
- **OpenStreetMap** - Für die Kartendaten

---

<div align="center">

**🌲 Erlebe den Wald digital - mit TannenTails! 🦊**

[Demo](https://your-demo-url.com) • [Dokumentation](https://your-docs-url.com) • [Issues](https://github.com/your-username/TannenTails/issues)

</div>