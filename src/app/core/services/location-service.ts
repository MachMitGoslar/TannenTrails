import { inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private platform = inject(Platform);
  private permissionGranted: boolean | null = null;
  private currentWatchId: string | null = null;
  
  constructor() {}

  async checkPermissionStatus(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      // Use Browser Permissions API for web applications
      try {
        // if (!navigator.permissions || !navigator.permissions.query) {
        //   // Fallback for browsers that don't support Permissions API
        //   console.warn('Permissions API not supported, assuming permission granted');
        //   return true;
        // }

        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        const isGranted = permissionStatus.state === 'granted';
        this.permissionGranted = isGranted;
        
        // Listen for permission changes
        permissionStatus.addEventListener('change', () => {
          this.permissionGranted = permissionStatus.state === 'granted';
          console.log('Geolocation permission changed to:', permissionStatus.state);
        });
        
        return isGranted;
      } catch (error) {
        console.warn('Error checking browser geolocation permissions:', error);
        // Fallback to true for compatibility
        return true;
      }
    }

    try {
      const permission = await Geolocation.checkPermissions();
      const isGranted = permission.location === 'granted';
      this.permissionGranted = isGranted;
      return isGranted;
    } catch (error) {
      console.warn('Error checking geolocation permissions:', error);
      return false;
    }
  }

  async requestLocationPermission(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      // For web browsers, we need to trigger a geolocation request to prompt for permission
      try {
        // Check current permission status first
        const currentStatus = await this.checkPermissionStatus();
        if (currentStatus) {
          this.permissionGranted = true;
          return true;
        }

        // For browsers, we trigger permission by attempting to get position
        // This will show the browser's native permission prompt
        await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
          );
        });

        // If we get here, permission was granted
        this.permissionGranted = true;
        return true;
      } catch (error) {
        console.warn('Browser geolocation permission denied or error:', error);
        this.permissionGranted = false;
        return false;
      }
    }

    // Check current status first to avoid unnecessary requests
    const currentStatus = await this.checkPermissionStatus();
    if (currentStatus) {
      return true;
    }

    // Only request if not already granted
    try {
      const permission = await Geolocation.requestPermissions();
      const isGranted = permission.location === 'granted';
      this.permissionGranted = isGranted;
      return isGranted;
    } catch (error) {
      console.error('Error requesting geolocation permissions:', error);
      this.permissionGranted = false;
      return false;
    }
  }

  watchPosition(): Observable<Position> {
    return new Observable<Position>((observer) => {
      let watchId: number | string | null = null;
      
      const startWatching = async () => {
        try {
          // Check permission status first
          let hasPermission = this.permissionGranted;
          
          if (hasPermission === null) {
            hasPermission = await this.checkPermissionStatus();
          }
          
          if (!hasPermission) {
            hasPermission = await this.requestLocationPermission();
          }

          if (hasPermission) {
            if (!this.platform.is('hybrid')) {
              // Use browser native geolocation API
              if (!navigator.geolocation) {
                observer.error('Geolocation is not supported by this browser');
                return;
              }

              watchId = navigator.geolocation.watchPosition(
                (position) => {
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
                      heading: position.coords.heading
                    }
                  };
                  observer.next(capacitorPosition);
                },
                (error) => {
                  console.error('Browser geolocation error:', error);
                  observer.error('Error watching location: ' + error.message);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 20000,
                  maximumAge: 5000
                }
              );
            } else {
              // Use Capacitor geolocation for mobile apps
              // Clear any existing watch
              if (this.currentWatchId) {
                await Geolocation.clearWatch({ id: this.currentWatchId });
              }

              const capacitorWatchId = await Geolocation.watchPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
              }, (position, err) => {
                if (err) {
                  console.error('Capacitor geolocation error:', err);
                  observer.error('Error watching location: ' + err);
                } else if (position) {
                  observer.next(position);
                }
              });
              
              this.currentWatchId = capacitorWatchId;
            }
          } else {
            observer.error('Location permission not granted');
          }
        } catch (error) {
          console.error('Error in watchPosition:', error);
          observer.error('Failed to start location watching: ' + error);
        }
      };

      startWatching();
      
      // Return cleanup function
      return () => {
        if (!this.platform.is('hybrid') && typeof watchId === 'number') {
          // Browser cleanup
          navigator.geolocation.clearWatch(watchId);
        } else if (this.currentWatchId) {
          // Capacitor cleanup
          Geolocation.clearWatch({ id: this.currentWatchId }).catch(err => {
            console.warn('Error clearing watch:', err);
          });
          this.currentWatchId = null;
        }
      };
    });
  }

  async getCurrentPosition(): Promise<Position> {
    // Check permission before getting position
    let hasPermission = this.permissionGranted;
    
    if (hasPermission === null) {
      hasPermission = await this.checkPermissionStatus();
    }
    
    if (!hasPermission) {
      hasPermission = await this.requestLocationPermission();
    }

    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    try {
      if (!this.platform.is('hybrid')) {
        // Use browser native geolocation API
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        return new Promise<Position>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
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
                  heading: position.coords.heading
                }
              };
              resolve(capacitorPosition);
            },
            (error) => {
              console.error('Browser geolocation error:', error);
              reject(new Error('Failed to get current position: ' + error.message));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000
            }
          );
        });
      } else {
        // Use Capacitor geolocation for mobile apps
        return await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        });
      }
    } catch (error) {
      console.error('Error getting current position:', error);
      throw new Error('Failed to get current position: ' + error);
    }
  }

  // Method to reset permission status (useful for testing or manual reset)
  resetPermissionStatus(): void {
    this.permissionGranted = null;
  }
}
