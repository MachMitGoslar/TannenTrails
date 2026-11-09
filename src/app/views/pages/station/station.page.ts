import { Component, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as L from 'leaflet';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
} from '@ionic/angular';
import { Position } from '@capacitor/geolocation';
import { map, scan } from 'rxjs';
import { headingTo, insideCircle } from 'geolocation-utils';
import { Station } from 'src/app/core/models/station.model';
import { StationData, QuestionData } from 'src/app/core/models/dataset';
import { LocationService } from 'src/app/core/services/location-service';
import { GameService } from 'src/app/core/services/game-service';
import {
  QuestionAnswer,
  QuestionCardComponent,
} from '../../components/question-card/question-card.component';
import { StarsAnimationComponent } from '../../components/animations/stars/stars-animation.component';

interface StationNavigation {
  /** Distance to the station in metres, null while no position is known. */
  distance: number | null;
  /** Latched: once the user reached the station it stays true, so GPS jitter cannot hide the quiz. */
  inRadius: boolean;
  /** Compass direction the user is moving in. */
  heading: string;
  /** Compass direction from the user to the station. */
  headingToStation: string;
}

const NO_NAVIGATION: StationNavigation = {
  distance: null,
  inRadius: false,
  heading: 'Unknown',
  headingToStation: 'Unknown',
};

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    DecimalPipe,
    RouterModule,
    QuestionCardComponent,
    StarsAnimationComponent,
  ],
})
export class StationPage {
  private route = inject(ActivatedRoute);
  private locationService = inject(LocationService);
  private gameService = inject(GameService);

  /** Undefined when the route points to an unknown station id. */
  readonly station: Station | undefined = this.resolveStation();
  readonly navigation: Signal<StationNavigation> = this.setupNavigation();

  questionAnsweredSuccessfully = false;
  successAnimationDone = false;

  constructor() {
    if (this.station && this.gameService.isStationSolved(this.station)) {
      this.questionAnsweredSuccessfully = true;
      this.successAnimationDone = true;
    }
  }

  private resolveStation(): Station | undefined {
    const stationId = this.route.snapshot.paramMap.get('id');
    const station = StationData.find(s => s.id === stationId);
    if (!stationId || !station) {
      return undefined;
    }
    // Copy instead of mutating the shared dataset entry
    return new Station(station.id, { ...station, question: QuestionData[stationId] });
  }

  private setupNavigation(): Signal<StationNavigation> {
    const station = this.station;
    if (!station) {
      return signal(NO_NAVIGATION).asReadonly();
    }
    const target = { lat: station.positionLat, lon: station.positionLng };
    const targetLatLng = L.latLng(station.positionLat, station.positionLng);

    // toSignal unsubscribes on destroy, which releases the shared GPS watcher
    return toSignal(
      this.locationService.watchPosition().pipe(
        map((position: Position | null): StationNavigation => {
          if (!position) {
            return NO_NAVIGATION;
          }
          const { latitude, longitude, heading } = position.coords;
          const here = { lat: latitude, lon: longitude };
          return {
            distance: targetLatLng.distanceTo(L.latLng(latitude, longitude)),
            inRadius: insideCircle(here, target, station.radius),
            heading: this.locationService.degreesToCompass(heading),
            headingToStation: this.locationService.degreesToCompass(headingTo(here, target)),
          };
        }),
        scan((previous, current) => ({
          ...current,
          inRadius: previous.inRadius || current.inRadius,
        }))
      ),
      { initialValue: NO_NAVIGATION }
    );
  }

  handleAnswerSubmission(answer: QuestionAnswer): void {
    if (this.station && answer.isCorrect) {
      this.gameService.solveStation(this.station);
      this.questionAnsweredSuccessfully = true;
    }
  }

  setAnimationDone(done: boolean): void {
    this.successAnimationDone = done;
  }
}
