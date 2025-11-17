import { Injectable } from '@angular/core';
import { Station } from '../models/station.model';
import { StationData } from '../models/dataset';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private solvedStations: Set<Station> = new Set<Station>();
  private currentStation: Station | null = null;
  private unsolvedStations: Set<Station> = new Set<Station>();

  public $stations = new ReplaySubject<{
    solved: Set<Station>;
    current: Station | null;
    unsolved: Set<Station>;
  }>(1);

  constructor() {
    StationData.forEach(station => {
      this.unsolvedStations.add(station);
    });
    this.currentStation = this.unsolvedStations.values().next().value || null;
    this.publishState();
  }

  solveStation(station: Station): void {
    this.solvedStations.add(station);
    this.unsolvedStations.delete(station);
    this.currentStation = station.nextStationId
      ? Array.from(this.unsolvedStations).find(s => s.id === station.nextStationId) || null
      : null;
    this.publishState();
  }

  solveRandomStation(): void {
    const unsolvedArray = Array.from(this.unsolvedStations);
    if (unsolvedArray.length === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * unsolvedArray.length);
    const stationToSolve = unsolvedArray[randomIndex];
    this.solveStation(stationToSolve);
  }

  setCurrentStation(station: Station): void {
    this.currentStation = station;
    this.publishState();
  }

  private publishState(): void {
    this.$stations.next({
      solved: this.solvedStations,
      current: this.currentStation,
      unsolved: this.unsolvedStations,
    });
  }
  isStationSolved(station: Station): boolean {
    return this.solvedStations.has(station);
  }
}
