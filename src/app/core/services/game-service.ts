import { inject, Injectable } from '@angular/core';
import { Station } from '../models/station.model';
import { StationData } from '../models/dataset';
import { ReplaySubject } from 'rxjs';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private solvedStations: Map<string, Station> = new Map<string, Station>();
  private unsolvedStations: Map<string, Station> = new Map<string, Station>();

  public $stations = new ReplaySubject<{
    solved: Map<string, Station>;
    unsolved: Map<string, Station>;
  }>(1);

  private db = inject(Firestore);

  constructor() {
    StationData.forEach(station => {
      this.unsolvedStations.set(station.id, station);
    });
    this.publishState();
  }

  solveStation(station: Station): void {
    this.solvedStations.set(station.id, station);
    this.unsolvedStations.delete(station.id);
    this.publishState();
  }

  // For testing purposes: solve a random station
  solveRandomStation(): void {
    if (this.unsolvedStations.size === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * this.unsolvedStations.size);
    const stationToSolve = this.unsolvedStations.get(String(randomIndex));
    if (!stationToSolve) {
      return;
    }
    this.solveStation(stationToSolve);
  }

  private publishState(): void {
    this.$stations.next({
      solved: this.solvedStations,
      unsolved: this.unsolvedStations,
    });
  }

  isStationSolved(station: Station): boolean {
    return this.solvedStations.has(station.id);
  }

  private writeStateToFirestore(userId: string) {
    let user_badge_ref = collection(this.db, `users/${userId}/badges`);

    let badge_query = query(user_badge_ref, where('organisationId', '==', 'stadtforst'));
    getDocs(badge_query).then(querySnapshot => {
      querySnapshot.forEach(doc => {
        console.log('User has badge:', doc.id, 'Data:', doc.data());
        if (doc.exists() && this.solvedStations) {
        }
      });
    });
  }
}
