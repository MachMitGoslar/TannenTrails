import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { EnvironmentProviders, provideZoneChangeDetection } from '@angular/core';

let providers = [
  provideZoneChangeDetection(),
  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  provideIonicAngular(),
  provideRouter(routes, withPreloading(PreloadAllModules)),
];

console.log('Environment:', environment);

if (environment.firebaseConfig.enabled) {
  const firebaseApp = initializeApp(environment.firebaseConfig);

  providers.push(
    provideFirebaseApp(() => firebaseApp),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore(firebaseApp))
  );
}

bootstrapApplication(AppComponent, {
  providers: providers,
});
