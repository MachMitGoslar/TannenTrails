import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, HostListener, inject } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
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
import { Router } from '@angular/router';
import { LocationService } from 'src/app/core/services/location-service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { map, polyline } from 'leaflet';
import { GameService } from 'src/app/core/services/game-service';
import { Observable, Subscription } from 'rxjs';
import { StationBarComponent } from '../station-bar/station-bar.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [IonContent, CommonModule, StationBarComponent],
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
  public activeStation?: Station;
  private activeStationObserver?: Subscription;

  public router = inject(Router);
  public locationService = inject(LocationService);
  public notificationService = inject(NotificationService);
  public gameService = inject(GameService);

  constructor() {}

  ngOnInit() {
    console.log('OverviewComponent initialized');
  }

  ngAfterViewInit() {
    this.map = L.map('map');
    this.map.setView([51.9045, 10.4196], 13);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    //Draw the Path

    this.map.whenReady(() => {
      console.log('Map loaded');

      //Add layers

      this.setupCenterControl();

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
    });

    L.tileLayer
      .provider('MapBox', {
        id: 'rangarian/cknynkupm0krp17qml0xbyw7c',
        accessToken:
          'pk.eyJ1IjoicmFuZ2FyaWFuIiwiYSI6ImNrZGVxNzNhODI5MTcyenM4dGR5bnZhb3UifQ.7WvcNEBQJn9iV42IiyG8rQ',
      })
      .addTo(this.map);

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
        this.unsolvedLayer.clearLayers();
        this.solvedLayer.clearLayers();

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
    stations: Set<Station>,
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
      marker.on('click', event => {
        if (this.activeStation) this.activeStation = undefined;
        if (this.activeStationObserver) this.activeStationObserver.unsubscribe();
        this.activeStationMarker?.setIcon(
          L.icon({
            iconUrl: 'assets/map/pin.svg',
            iconSize: iconSize,
            iconAnchor: [11, 40],
            popupAnchor: [-3, -76],
          })
        );
        this.activeStationMarker = event.target as L.Marker;
        this.setupUserPath(this.userLayer.getBounds().getCenter());
        this.activeStationObserver = this.locationService
          .setupDistanceObserver(this.activeStationMarker.getLatLng(), station.radius)
          .subscribe({
            next: inRadius => {
              console.log('User in radius of station', station.id, ':', inRadius);
              if (inRadius) {
                this.activeStationObserver?.unsubscribe();
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
    this.locationService.watchPosition().subscribe(
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

  setupCenterControl() {
    console.log('Setting up center control');
    let center = new L.Control({
      position: 'topright',
    });
    center.onAdd = (map: L.Map) => {
      const div = L.DomUtil.create('div', 'leaflet-control-center leaflet-control leaflet-bar');
      div.innerHTML = '<a title="Zentriere Karte auf Benutzerposition">🦊</a>';
      div.onclick = () => {
        this.map.flyToBounds(this.userLayer.getBounds(), { padding: [50, 50] });
      };
      return div as HTMLElement;
    };
    center.addTo(this.map);
    (this.map as any)._centerControl = center;

    let center2 = new L.Control({
      position: 'topright',
    });
    center2.onAdd = (map: L.Map) => {
      const div = L.DomUtil.create('div', 'leaflet-control-center leaflet-control leaflet-bar');
      div.innerHTML = '<a title="Zentriere Karte auf Pfad">🌲</a>';
      div.onclick = () => {
        this.map.flyToBounds(this.path!.getBounds(), { padding: [50, 50] });
      };
      return div as HTMLElement;
    };
    center2.addTo(this.map);
    (this.map as any)._centerControl = center2;
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
