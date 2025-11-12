import { inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  Geolocation,
  Position,
  PermissionStatus,
} from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private platform = inject(Platform);
  private permissionGranted: boolean = false;
  public permissionGranted$: BehaviorSubject <boolean> = new BehaviorSubject<boolean>(false);
  public my_position$: BehaviorSubject<Position | null> = new BehaviorSubject<Position | null>(null);
  private currentWatchId: string | number | null = null;

  constructor() {}

  checkPermissionStatus() {
    if (!this.platform.is('hybrid')) {

          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Position obtained for permission check:', position )
              this.permissionGranted$.next(true);
              this.permissionGranted = true;
            },
            (error) => {
              console.error('Error obtaining position for permission check:', error);
              this.permissionGranted$.next(false);
              this.permissionGranted = false;
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
          );

        navigator.permissions.query({ name: 'geolocation' }).then(
          (permissionStatus) => {
            const isGranted = permissionStatus.state === 'granted';
            this.permissionGranted$.next(isGranted);
            this.permissionGranted = isGranted;
            permissionStatus.addEventListener('change', () => {
              this.permissionGranted$.next(permissionStatus.state === 'granted');
              this.permissionGranted = permissionStatus.state === 'granted';
              console.log(
                'Geolocation permission changed to:',
                permissionStatus.state
              );
            });
          });

        // Listen for permission changes

    }

    else {
      Geolocation.checkPermissions().then((permission) => {
        const isGranted = permission.location === 'granted';
        this.permissionGranted$.next(isGranted);
        this.permissionGranted = isGranted;
      }, error => {
        console.error('Error checking geolocation permissions:', error);
        this.permissionGranted$.next(false);
        this.permissionGranted = false;
      });
    }
    return this.permissionGranted$.asObservable();
  }


  watchPosition(): Observable<Position | null> {


    this.setupPositionObservable();

    return this.my_position$.asObservable();

  }


  setupPositionObservable() {
    if (!this.platform.is('hybrid')) {
          // Use browser native geolocation API
          if (!navigator.geolocation) {
            this.my_position$!.error(
              'Geolocation is not supported by this browser'
            );
          }

          this.currentWatchId = navigator.geolocation.watchPosition(
            (position) => {
              // Convert browser GeolocationPosition to Capacitor Position format
              const capacitorPosition: Position = {
                timestamp: position.timestamp,
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy:
                    position.coords.altitudeAccuracy || undefined,
                  altitude: position.coords.altitude,
                  speed: position.coords.speed,
                  heading: position.coords.heading,
                },
              };
              this.my_position$!.next(capacitorPosition);
            },
            (error) => {
              console.error('Browser geolocation error:', error);
              this.my_position$!.error(
                'Error watching location: ' + error.message
              );
            },

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
          ).then((capacitorWatchId) => {
            this.currentWatchId = capacitorWatchId;
          });
        }
      }
    
}
    