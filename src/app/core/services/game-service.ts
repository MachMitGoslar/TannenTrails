import { inject, Injectable } from '@angular/core';
import { Station } from '../models/station.model';
import { StationData } from '../models/dataset';
import { ReplaySubject } from 'rxjs';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly STORAGE_KEY = 'tannentails_solved_stations';
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
    this.loadFromStorage();
    this.publishState();
  }

  solveStation(station: Station): void {
    this.solvedStations.set(station.id, station);
    this.unsolvedStations.delete(station.id);
    this.saveToStorage();
    this.publishState();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const ids: string[] = JSON.parse(raw);
      ids.forEach(id => {
        const station = this.unsolvedStations.get(id);
        if (station) {
          this.solvedStations.set(id, station);
          this.unsolvedStations.delete(id);
        }
      });
    } catch {
      // Corrupted storage — start fresh
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.solvedStations.keys()]));
  }

  // For testing purposes: solve a random station
  solveRandomStation(): void {
    if (this.unsolvedStations.size === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * this.unsolvedStations.size);
    const stationToSolve = this.unsolvedStations.get(String(randomIndex));
    if (!stationToSolve) {
      console.log('No station found to solve at index:', randomIndex);
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
        if (doc.exists() && this.solvedStations.get(doc.id)) {
          //Badge
        }
      });
    });
  }
}
