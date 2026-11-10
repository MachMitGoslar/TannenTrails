// Copy this file to environment.ts (development) and environment.prod.ts (production)
// and fill in the real values. Never commit environment.ts or environment.prod.ts.

export const environment = {
  production: false, // set true in environment.prod.ts
  mockGps: true, // set false to use real GPS; always false in environment.prod.ts

  // Mapbox — tile layer for the trail map
  mapboxToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
  mapboxStyleId: 'YOUR_MAPBOX_STYLE_ID', // style id only; the account name is part of the tile URL

  // Firebase project: best-badges-dev
  firebaseConfig: {
    enabled: true, // set false to disable Firebase; always false in environment.prod.ts
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    databaseURL: 'https://YOUR_PROJECT-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'YOUR_PROJECT',
    storageBucket: 'YOUR_PROJECT.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID',
    databaseId: 'bridge',
  },
};
