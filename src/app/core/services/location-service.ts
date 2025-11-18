import { inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { PathData } from '../models/dataset';
import { insideCircle } from 'geolocation-utils';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private platform = inject(Platform);
  private permissionGranted: boolean = false;
  public permissionGranted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public my_position$: BehaviorSubject<Position | null> = new BehaviorSubject<Position | null>(
    null
  );
  private currentWatchId: string | number | null = null;

  constructor() {}

  checkPermissionStatus() {
    if (!this.platform.is('hybrid')) {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('Position obtained for permission check:', position);
          this.permissionGranted$.next(true);
          this.permissionGranted = true;
        },
        error => {
          console.error('Error obtaining position for permission check:', error);
          this.permissionGranted$.next(false);
          this.permissionGranted = false;
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );

      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        const isGranted = permissionStatus.state === 'granted';
        this.permissionGranted$.next(isGranted);
        this.permissionGranted = isGranted;
        permissionStatus.addEventListener('change', () => {
          this.permissionGranted$.next(permissionStatus.state === 'granted');
          this.permissionGranted = permissionStatus.state === 'granted';
          console.log('Geolocation permission changed to:', permissionStatus.state);
        });
      });

      // Listen for permission changes
    } else {
      Geolocation.checkPermissions().then(
        permission => {
          const isGranted = permission.location === 'granted';
          this.permissionGranted$.next(isGranted);
          this.permissionGranted = isGranted;
        },
        error => {
          console.error('Error checking geolocation permissions:', error);
          this.permissionGranted$.next(false);
          this.permissionGranted = false;
        }
      );
    }
    return this.permissionGranted$.asObservable();
  }

  watchPosition(mock: boolean = false): Observable<Position | null> {
    if (mock) {
      let GPS_MOCK_DATA = PathData;
      let index = 0;

      setInterval(() => {
        let mockPosition: Position = {
          coords: {
            latitude: GPS_MOCK_DATA[index][0],
            longitude: GPS_MOCK_DATA[index][1],
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        index++;
        if (index >= GPS_MOCK_DATA.length) index = 0;
        this.my_position$.next(mockPosition);
      }, 1000);
      return this.my_position$.asObservable();
    }

    this.setupPositionObservable();

    return this.my_position$.asObservable();
  }

  setupPositionObservable() {
    if (!this.platform.is('hybrid')) {
      // Use browser native geolocation API
      if (!navigator.geolocation) {
        this.my_position$!.error('Geolocation is not supported by this browser');
      }

      this.currentWatchId = navigator.geolocation.watchPosition(
        position => {
          // Convert browser GeolocationPosition to Capacitor Position format
          const capacitorPosition: Position = {
            timestamp: position.timestamp,
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              heading: position.coords.heading,
            },
          };
          this.my_position$!.next(capacitorPosition);
        },
        error => {
          console.error('Browser geolocation error:', error);
          this.my_position$!.error('Error watching location: ' + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    } else {
      // Use Capacitor geolocation for mobile apps
      // Clear any existing watch
      if (this.currentWatchId) {
        if (typeof this.currentWatchId === 'number') {
          navigator.geolocation.clearWatch(this.currentWatchId);
        }
      }

      Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
        (position, err) => {
          if (err) {
            console.error('Capacitor geolocation error:', err);
            this.my_position$!.error('Error watching location: ' + err);
          } else if (position) {
            this.my_position$!.next(position);
          }
        }
      ).then(capacitorWatchId => {
        this.currentWatchId = capacitorWatchId;
      });
    }
  }

  setupDistanceObserver(latLng: L.LatLng, radius: number): Observable<boolean> {
    return this.my_position$.pipe(
      map(position => {
        if (position) {
          return insideCircle(position.coords, { lat: latLng.lat, lon: latLng.lng }, radius);
        }
        return false;
      })
    );
  }

  /**
   * Converts heading degrees to compass direction string
   * @param degrees - Heading in degrees (0-360)
   * @returns Compass direction string (N, NNE, NE, ENE, E, etc.)
   */
  degreesToCompass(degrees: number | null | undefined): string {
    if (degrees === null || degrees === undefined) {
      return 'Unknown';
    }

    // Normalize degrees to 0-360 range
    const normalizedDegrees = ((degrees % 360) + 360) % 360;

    // 16-point compass directions
    const directions = [
      'N', // 0° (North)
      'NNO', // 22.5° (North-Northeast)
      'NO', // 45° (Northeast)
      'ONO', // 67.5° (East-Northeast)
      'O', // 90° (East)
      'OSO', // 112.5° (East-Southeast)
      'SO', // 135° (Southeast)
      'SSO', // 157.5° (South-Southeast)
      'S', // 180° (South)
      'SSW', // 202.5° (South-Southwest)
      'SW', // 225° (Southwest)
      'WSW', // 247.5° (West-Southwest)
      'W', // 270° (West)
      'WNW', // 292.5° (West-Northwest)
      'NW', // 315° (Northwest)
      'NNW', // 337.5° (North-Northwest)
    ];

    // Calculate the index (each direction covers 22.5 degrees)
    const index = Math.round(normalizedDegrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Gets the current heading as a compass direction string
   * @returns Observable of compass direction string
   */
  getCurrentCompassDirection(): Observable<string> {
    return this.my_position$.pipe(
      map(position => {
        const heading = position?.coords?.heading;
        return this.degreesToCompass(heading);
      })
    );
  }
}
