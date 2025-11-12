import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, HostListener} from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle,  } from "@ionic/angular/standalone";
import { PathData, StationData } from "../../../core/models/dataset";
import { Station } from 'src/app/core/models/station.model';

import * as L from 'leaflet';
import  'leaflet-gpx';
import 'leaflet-providers';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/core/services/location-service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { map, polyline } from 'leaflet';
import { GameService } from 'src/app/core/services/game-service';



@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, CommonModule]
})
export class OverviewComponent  implements OnInit, AfterViewInit {

    private map!: L.Map





  constructor(
    public router: Router, 
    public locationService: LocationService,
    public notificationService: NotificationService,
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.map = L.map('map');
    this.map.setView([51.9045, 10.4196], 13);

    
    L.tileLayer.provider('MapBox', {
    id: 'rangarian/cknynkupm0krp17qml0xbyw7c',
    accessToken: 'pk.eyJ1IjoicmFuZ2FyaWFuIiwiYSI6ImNrZGVxNzNhODI5MTcyenM4dGR5bnZhb3UifQ.7WvcNEBQJn9iV42IiyG8rQ'
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    //Draw the Path
    let line = new L.Polyline(PathData.map( point => [point[1], point[0]] ), {color: 'blue'});
    line.addTo(this.map);
    (this.map as any)._line = line;
    
    this.setupStationObservers();


    
    //Fit all to map
    this.map.flyToBounds(line.getBounds(), {padding: [-140, -140]});
    this.setupLocation();

  }
  onResize(): void {
    this.map.invalidateSize();
  }

  setupStationObservers() {
    this.gameService.$stations.subscribe({
      next: (stationData) => {
        console.log("Updating station markers on map", stationData);
          // Clear existing markers
          if ((this.map as any)._markerLayer) {
            (this.map as any)._markerLayer.remove();
          }
          this.drawStationMarkers(stationData.unsolved, 'assets/map/pin.svg', [30, 35]);
          this.drawStationMarkers(stationData.solved, 'assets/map/pin_complete.svg', [30, 35]); 
      },
      error: (error) => {
        console.error("Error updating station markers:", error);
      }
    });
  }

  drawStationMarkers(stations: Set<Station>, pinUrl: string, iconSize: [number, number]) {
    console.log("Drawing station markers:", stations);
    let markerLayer = L.layerGroup().addTo(this.map);
    stations.forEach( (station: Station) => {
      const marker = L.marker(
        [station.positionLat, station.positionLng],
        { 
          title: station.title,
          riseOnHover: true,
          // Add any additional marker options here
          icon: L.icon({
            iconUrl: pinUrl,
            iconAnchor: iconSize,
            popupAnchor: [-3, -76],
          })
         }
      ).addTo(markerLayer);
      marker.on('click', (event) => this.router.navigate(['/station', station.id]));
    });
    (this.map as any)._markerLayer = markerLayer;
  }
  

  setupLocation() {
    this.locationService.requestLocationPermission().then( granted => {
      if (granted) {
          this.setupCenterControl();

      } else {
        this.notificationService.gpsUnavailable();
      }
    });
  
    this.locationService.watchPosition().subscribe( position => {
      console.log("Position:", position);
      const latLng = L.latLng(position.coords.latitude, position.coords.longitude);
      const accuracy = position.coords.accuracy;

      // Add or update the accuracy circle
      let accuracyCircle = (this.map as any)._accuracyCircle;
      if (!accuracyCircle) {
        accuracyCircle = L.circle(latLng, { radius: accuracy, color: 'blue', opacity: 0.2 }).addTo(this.map);
        (this.map as any)._accuracyCircle = accuracyCircle;
      } else {
        accuracyCircle.setLatLng(latLng);
        accuracyCircle.setRadius(accuracy);
      }

      // Add or update the user marker
      let userMarker = (this.map as any)._userMarker;
      if (!userMarker) {
        userMarker = L.marker(latLng, {
          icon: L.icon({
            iconUrl: 'assets/map/fox.svg',
            iconSize: [40, 40],
            iconAnchor: [20, 35],

          }),
          zIndexOffset: 1000,
          attribution: 'User Location',
          
        }).addTo(this.map);
        (this.map as any)._userMarker = userMarker;
        
      } else {
        userMarker.setLatLng(latLng);
      }
      this.setupUserPath();
    }, error => {
      this.notificationService.gpsUnavailable();
      console.error("Location Error:", error);
    });
  }


  setupCenterControl() {
    console.log("Setting up center control");
    let center = new L.Control({
      position: 'topright',
    })
    center.onAdd = (map: L.Map) => {
      const div = L.DomUtil.create('div', 'leaflet-control-center leaflet-control leaflet-bar');
      div.innerHTML = '<a title="Zentriere Karte auf Benutzerposition">🦊</a>';
      div.onclick = () => {
        let user = (this.map as any)._userMarker as L.Marker;
        if (user) {
          this.map.flyTo(user.getLatLng(), 16);
        }
      };
      return div as HTMLElement;
    };
    center.addTo(this.map);
    (this.map as any)._centerControl = center;

    let center2 = new L.Control({
      position: 'topright',
    })
    center2.onAdd = (map: L.Map) => {
      const div = L.DomUtil.create('div', 'leaflet-control-center leaflet-control leaflet-bar');
      div.innerHTML = '<a title="Zentriere Karte auf Benutzerposition">🎯</a>';
      div.onclick = () => {
        this.gameService.solveRandomStation();
      };
      return div as HTMLElement;
    };
    center2.addTo(this.map);
    (this.map as any)._centerControl = center2;
  }

  

  setupUserPath() {
    let user = (this.map as any)._userMarker as L.Marker;
    if (!user) return;
    let polyline = (this.map as any)._line as L.Polyline;
    if (!polyline) return;

    let user_canvas_point = this.map.latLngToLayerPoint(user.getLatLng());
    let closestPoint = polyline.closestLayerPoint(user_canvas_point);
    let closestLatLng = this.map.layerPointToLatLng(closestPoint);

    let userPath = (this.map as any)._userPath as L.Polyline;
    if (!userPath) {
      userPath = L.polyline([user.getLatLng(), closestLatLng], {color: 'red', dashArray: '5, 10'}).addTo(this.map);
      (this.map as any)._userPath = userPath;
    } else {
      userPath.setLatLngs([user.getLatLng(), closestLatLng]);
    }
  }

}
