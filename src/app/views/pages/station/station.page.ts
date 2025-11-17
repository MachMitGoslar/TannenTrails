import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  IonSpinner,
} from '@ionic/angular/standalone';
import { Station } from 'src/app/core/models/station.model';
import { StationData, QuestionData } from 'src/app/core/models/dataset';
import { ActivatedRoute } from '@angular/router';
import { MultipleChoiceQuestion } from 'src/app/core/models/questions.model';
import { map, Observable } from 'rxjs';
import { LocationService } from 'src/app/core/services/location-service';
import { insideCircle } from 'geolocation-utils';
import { QuestionCardComponent } from "../../components/question-card/question-card.component";
import { GameService } from 'src/app/core/services/game-service';
import { StarsAnimationComponent } from "../../components/animations/stars/stars-animation.component";

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
  standalone: true,
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
    IonSpinner,
    CommonModule,
    FormsModule,
    RouterModule,
    QuestionCardComponent,
    StarsAnimationComponent
],
})
export class StationPage implements OnInit {
  station!: Station;
  heading: Observable<number> = new Observable<number>();
  distanceToStation: Observable<number> = new Observable<number>();
  inRadius: boolean = false;
  showQuestionCard: boolean = true;
  successAnimationDone: boolean = false;
  questionAnsweredSuccessfully: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService,
    private gameService: GameService
  ) {
    const stationId = this.route.snapshot.paramMap.get('id');
    this.station = StationData.find((s) => s.id === Number(stationId))!;
    this.station.question = QuestionData[Number(stationId)];
    if(this.gameService.isStationSolved(this.station)) {
      this.questionAnsweredSuccessfully = true;
      this.successAnimationDone = true;
      this.showQuestionCard = false;
    }
    // Icons are now preloaded in AppComponent
    this.setupDistanceObserver();
  }

  ngOnInit() {}



  // getQuestionOptions(): string[] {
  //   if (
  //     this.station?.question &&
  //     this.station.question instanceof MultipleChoiceQuestion
  //   ) {
  //     return this.station.question.options;
  //   }
  //   return [];
  // }

  setupDistanceObserver() {
    let station_pos = L.latLng(
      this.station.positionLat,
      this.station.positionLng
    );

    this.distanceToStation = this.locationService.watchPosition().pipe(
      map((position) => {
        if (position) {
          let distance = station_pos.distanceTo(
            L.latLng(position.coords.latitude, position.coords.longitude)
          );
          this.inRadius = insideCircle(
            { lat: position.coords.latitude, lon: position.coords.longitude },
            { lat: this.station.positionLat, lon: this.station.positionLng },
            this.station.radius
          );
          console.log('Distance to station:', distance);
          return distance;
        } else {
          return Infinity;
        }
      })
    );
    this.heading = this.locationService.watchPosition().pipe(
      map(
        (position) => {
          if (position) {
            return position.coords.heading ?? 200;
          } else {
            return 0;
          }
        },
        { defaultValue: 0 }
      )
    );
  }
  handleAnswerSubmission(event: any) {
    console.log('Answer submitted for station', this.station.id, ':', event);
    if(event.isCorrect) {
      this.gameService.solveStation(this.station);
      this.questionAnsweredSuccessfully = true;
    }
  }

  setAnimationDone(event: boolean) {
    console.log("Animation done event received:", event);
    this.successAnimationDone = event;
  }

  
}
