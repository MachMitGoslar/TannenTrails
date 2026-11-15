import { TestBed } from '@angular/core/testing';

import { GameService } from './game-service';
import { StationData } from '../models/dataset';

const STORAGE_KEY = 'tannentails_solved_stations';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('solves a station and persists it', () => {
    const station = StationData[0];
    service.solveStation(station);

    expect(service.isStationSolved(station)).toBeTrue();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([station.id]);
  });

  it('restores solved stations from storage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([StationData[1].id]));
    const restored = new GameService();

    expect(restored.isStationSolved(StationData[1])).toBeTrue();
  });

  it('solveRandomStation solves exactly one unsolved station per call until none remain', () => {
    for (let i = 0; i < StationData.length; i++) {
      service.solveRandomStation();
    }
    expect(StationData.every(s => service.isStationSolved(s))).toBeTrue();

    // No-op once everything is solved
    expect(() => service.solveRandomStation()).not.toThrow();
  });
});
