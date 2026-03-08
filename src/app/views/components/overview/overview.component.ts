import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, HostListener, inject } from '@angular/core';
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/angular/standalone';
import {
  PathData,
  Shortcuts,
  SpecialPoint,
  SpecialPoints,
  StationData,
} from '../../../core/models/dataset';
import { Station } from 'src/app/core/models/station.model';

import * as L from 'leaflet';
import 'leaflet-gpx';
import 'leaflet-providers';
import 'leaflet-rotate';
import { tileLayerOffline, savetiles, TileLayerOffline } from 'leaflet.offline';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/core/services/location-service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProgressModalService } from 'src/app/core/services/progress-modal.service';
import { map, polyline } from 'leaflet';
import { GameService } from 'src/app/core/services/game-service';
import { Observable, Subscription } from 'rxjs';
import { StationBarComponent } from '../station-bar/station-bar.component';
import { addIcons } from 'ionicons';
import {
  trophy,
  navigate,
  navigateOutline,
  locateOutline,
  trailSignOutline,
  bugOutline,
  layersOutline,
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    CommonModule,
    StationBarComponent,
  ],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private path?: L.Polyline;
  private trackingLine?: L.Polyline;
  private solvedLayer = L.featureGroup();
  private unsolvedLayer = L.featureGroup();
  private userLayer = L.featureGroup();
  private commonLayer = L.featureGroup([this.solvedLayer, this.unsolvedLayer, this.userLayer]);
  private activeStationMarker?: L.Marker;
  private activeStationRestIcon?: L.Icon;
  public activeStation?: Station;
  public navigationMode = false;
  private activeStationObserver?: Subscription;
  private bearingSubscription?: Subscription;
  private offlineTileLayer?: TileLayerOffline;
  private smoothedBearing = 0;

  public router = inject(Router);
  public locationService = inject(LocationService);
  public notificationService = inject(NotificationService);
  public gameService = inject(GameService);
  public progressModalService = inject(ProgressModalService);

  public isDev = !environment.production;

  constructor() {
    addIcons({
      trophy,
      navigate,
      navigateOutline,
      locateOutline,
      trailSignOutline,
      bugOutline,
      layersOutline,
    });
  }

  ngOnInit() {
    console.log('OverviewComponent initialized');
  }

  ngAfterViewInit() {
    this.map = L.map('map', { rotate: true, bearing: 0, zoomControl: false });
    this.map.setView([51.9045, 10.4196], 13);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    //Draw the Path

    this.map.whenReady(() => {
      console.log('Map loaded');

      //Draw initial path
      this.path = new L.Polyline(
        PathData.map(point => [point[0], point[1]]),
        { color: 'green' }
      ).addTo(this.map);

      let map_center = this.path.getBounds().getCenter();
      this.map.setView(map_center, 15);

      let shortcuts = Shortcuts;
      shortcuts.forEach((shortcut: Array<Array<number>>) => {
        let shortcutLine = new L.Polyline(
          shortcut.map(point => [point[0], point[1]]),
          { color: 'purple', dashArray: '5, 10' }
        ).addTo(this.map);
      });

      let specialPoints = SpecialPoints;
      this.drawSpecialMarkers(specialPoints, [30, 30]);
      this.setupStationObservers();
      this.setupLocation();
      this.map.addLayer(this.commonLayer);
      this.prefetchTiles();
    });

    this.offlineTileLayer = tileLayerOffline(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        id: environment.mapboxStyleId,
        accessToken: environment.mapboxToken,
        tileSize: 512,
        zoomOffset: -1,
        crossOrigin: true,
        attribution:
          '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      } as L.TileLayerOptions
    ).addTo(this.map);

    //Fit all to map
    //this.map.flyToBounds(line.getBounds(), {padding: [-140, -140]});
  }
  onResize(): void {
    this.map.invalidateSize();
  }

  setupStationObservers() {
    this.gameService.$stations.subscribe({
      next: stationData => {
        console.log('Updating station markers on map', stationData);
        // Clear existing markers
        this.solvedLayer.clearLayers();
        this.unsolvedLayer.clearLayers();

        this.drawStationMarkers(
          stationData.unsolved,
          'assets/map/pin.svg',
          [30, 35],
          this.unsolvedLayer
        );
        this.drawStationMarkers(
          stationData.solved,
          'assets/map/pin_complete.svg',
          [30, 35],
          this.solvedLayer
        );
      },
      error: error => {
        console.error('Error updating station markers:', error);
      },
    });
  }

  drawSpecialMarkers(specialPoints: SpecialPoint[], iconSize: [number, number]) {
    console.log('Drawing special point markers:', specialPoints);
    specialPoints.forEach((point: SpecialPoint) => {
      const marker = L.marker([point.lat, point.lng], {
        title: point.description,
        riseOnHover: true,
        // Add any additional marker options here
        icon: L.icon({
          iconUrl: 'assets/map/pin_parking.svg',
          iconSize: iconSize,
          iconAnchor: [20, 20],
          popupAnchor: [-3, -76],
        }),
      }).addTo(this.map);
    });
  }

  drawStationMarkers(
    stations: Map<string, Station>,
    pinUrl: string,
    iconSize: [number, number],
    layer: L.FeatureGroup
  ) {
    console.log('Drawing station markers:', stations);
    stations.forEach((station: Station) => {
      const marker = L.marker([station.positionLat, station.positionLng], {
        title: station.title,
        riseOnHover: true,
        // Add any additional marker options here
        icon: L.icon({
          iconUrl: pinUrl,
          iconSize: iconSize,
          iconAnchor: [11, 40],
          popupAnchor: [-3, -76],
        }),
      }).addTo(layer);
      //marker.on('click', (event) => this.router.navigate(['/station', station.id]));
      const restIcon = L.icon({
        iconUrl: pinUrl,
        iconSize,
        iconAnchor: [11, 40],
        popupAnchor: [-3, -76],
      });
      marker.on('click', event => {
        if (this.activeStation) this.activeStation = undefined;
        if (this.activeStationObserver) this.activeStationObserver.unsubscribe();
        this.bearingSubscription?.unsubscribe();
        this.navigationMode = false;
        this.map.setBearing(0);
        // Restore the previous active marker to its correct icon (solved or unsolved)
        if (this.activeStationMarker && this.activeStationRestIcon) {
          this.activeStationMarker.setIcon(this.activeStationRestIcon);
        }
        this.activeStationRestIcon = restIcon;
        this.activeStationMarker = event.target as L.Marker;
        this.setupUserPath(this.userLayer.getBounds().getCenter());
        this.activeStationObserver = this.locationService
          .setupDistanceObserver(this.activeStationMarker.getLatLng(), station.radius)
          .subscribe({
            next: inRadius => {
              console.log('User in radius of station', station.id, ':', inRadius);
              if (inRadius) {
                this.activeStationObserver?.unsubscribe();
                this.bearingSubscription?.unsubscribe();
                this.map.setBearing(0);
                this.router.navigate(['/station', station.id]);
                this.notificationService.showSuccess(
                  'Station erreichbar!',
                  `Du bist in der Nähe der Station "${station.title}". Jetzt kannst du die Aufgabe lösen! Bestimmt helfen dir die Informationen auf der Tafel weiter.`
                );
              }
            },
            error: error => {
              console.error('Error observing distance to station:', error);
            },
          });

        // Navigation view: rotate map to GPS heading and keep user in lower portion
        this.navigationMode = true;
        this.bearingSubscription = this.locationService.my_position$.subscribe(position => {
          if (!position || !this.activeStationMarker || !this.navigationMode) return;
          const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
          // Prefer the device's actual travel heading; fall back to bearing-to-station
          const rawHeading =
            position.coords.heading ??
            this.calculateBearing(userLatLng, this.activeStationMarker.getLatLng());
          // Exponential smoothing — interpolate the shortest arc to avoid wrap-around jumps
          let diff = rawHeading - this.smoothedBearing;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          this.smoothedBearing = (this.smoothedBearing + diff * 0.25 + 360) % 360;
          this.map.setBearing(this.smoothedBearing);
          // Pan to the user's actual position — this makes the fox marker the CSS transform-origin
          // so rotation pivots around it rather than around a forward-offset center.
          this.map.panTo(userLatLng, { animate: true, duration: 0.7 });
        });

        this.activeStationMarker.setIcon(
          L.icon({
            iconUrl: 'assets/map/pin_active.svg',
            iconSize: [iconSize[0] * 1.3, iconSize[1] * 1.3],
            iconAnchor: [17, 46],
            popupAnchor: [20, -76],
          })
        );
        L.circle(this.activeStationMarker.getLatLng(), {
          radius: station.radius,
          color: 'green',
          opacity: 0.2,
        }).addTo(this.unsolvedLayer);

        this.activeStation = station;

        // this.activeStationMarker.on('click', () => {
        //   this.router.navigate(['/station', station.id]);
        // });
      });
    });
  }

  setupLocation() {
    this.locationService.watchPosition(environment.mockGps).subscribe(
      position => {
        if (position != null) {
          console.log('Position:', position);
          const latLng = L.latLng(position.coords.latitude, position.coords.longitude);
          const accuracy = position.coords.accuracy;

          this.userLayer.clearLayers();

          L.circle(latLng, { radius: accuracy, color: 'blue', opacity: 0.2 }).addTo(this.userLayer);

          L.marker(latLng, {
            icon: L.icon({
              iconUrl: 'assets/map/fox.svg',
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            }),
            zIndexOffset: 1000,
            attribution: 'User Location',
          }).addTo(this.userLayer);
          this.setupUserPath(latLng);
        }
      },
      error => {
        console.error('Error getting user position:', error);
        this.notificationService.gpsUnavailable();
      }
    );
  }

  centerOnUser(): void {
    this.map.flyToBounds(this.userLayer.getBounds(), { padding: [50, 50] });
  }

  centerOnTrail(): void {
    this.map.flyToBounds(this.path!.getBounds(), { padding: [50, 50] });
  }

  solveRandomStation(): void {
    this.gameService.solveRandomStation();
  }

  /**
   * Open the progress modal to show user's achievements and station progress
   */
  async openProgressModal() {
    try {
      await this.progressModalService.openProgressModal(StationData.length);
    } catch (error) {
      console.error('Error opening progress modal:', error);
    }
  }

  toggleNavigationMode(): void {
    this.navigationMode = !this.navigationMode;
    if (!this.navigationMode) {
      this.smoothedBearing = 0;
      this.map.setBearing(0);
    }
  }

  private prefetchTiles(): void {
    if (!this.offlineTileLayer || !this.path) return;
    const bounds = this.path.getBounds();
    const control = savetiles(this.offlineTileLayer, {
      zoomlevels: [13, 14, 15, 16],
      bounds,
      maxZoom: 16,
      alwaysDownload: false,
      confirm: null,
      confirmRemoval: null,
      saveText: '',
      rmText: '',
    });
    control.addTo(this.map);
    // Hide the save-tiles UI button — we run this silently in the background
    const el = control.getContainer();
    if (el) el.style.display = 'none';

    this.offlineTileLayer.on('savestart', () => {
      this.notificationService.showSuccess(
        'Karte wird geladen',
        'Kartenkacheln werden für die Offline-Nutzung gespeichert…'
      );
    });
    this.offlineTileLayer.on('saveend', () => {
      this.notificationService.showSuccess(
        'Karte gespeichert',
        'Die Karte ist jetzt offline verfügbar.'
      );
      control.remove();
    });

    control._saveTiles();
  }

  private geoOffset(origin: L.LatLng, bearingDeg: number, distanceMeters: number): L.LatLng {
    const R = 6371000;
    const δ = distanceMeters / R;
    const θ = (bearingDeg * Math.PI) / 180;
    const φ1 = (origin.lat * Math.PI) / 180;
    const λ1 = (origin.lng * Math.PI) / 180;
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
      );
    return L.latLng((φ2 * 180) / Math.PI, (λ2 * 180) / Math.PI);
  }

  private calculateBearing(from: L.LatLng, to: L.LatLng): number {
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  setupUserPath(user_position: L.LatLng) {
    if (!this.activeStationMarker) return;

    let user_canvas_point = this.map.latLngToLayerPoint(user_position);
    console.log('User canvas point:', user_canvas_point);
    if (user_canvas_point == null) return;

    let closestPoint = this.activeStationMarker.getLatLng();

    let userPath = (this.map as any)._userPath as L.Polyline;
    if (!this.trackingLine) {
      this.trackingLine = L.polyline([user_position, closestPoint], {
        color: 'red',
        dashArray: '5, 10',
      }).addTo(this.map);
    } else {
      this.trackingLine.setLatLngs([user_position, closestPoint]);
    }
  }
}
