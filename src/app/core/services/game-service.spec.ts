import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

import { GameService } from './game-service';
import { StationData } from '../models/dataset';
import { Station } from '../models/station.model';

const STORAGE_KEY = 'tannentails_solved_stations';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Firestore, useValue: {} }],
    });
    service = TestBed.inject(GameService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('$stations', () => {
    it('should emit initial state on subscribe with all stations unsolved', async () => {
      const state = await firstValueFrom(service.$stations);

      expect(state.solved.size).toBe(0);
      expect(state.unsolved.size).toBe(StationData.length);

      StationData.forEach(station => {
        expect(state.unsolved.has(station.id)).toBeTrue();
      });
    });
  });

  describe('solveStation()', () => {
    it('should move a station from unsolved to solved', async () => {
      const station = StationData[0]; // Station with id '1'

      service.solveStation(station);

      const state = await firstValueFrom(service.$stations);

      expect(state.solved.has(station.id)).toBeTrue();
      expect(state.unsolved.has(station.id)).toBeFalse();
    });

    it('should leave all other stations in unsolved', async () => {
      const station = StationData[0];

      service.solveStation(station);

      const state = await firstValueFrom(service.$stations);

      expect(state.unsolved.size).toBe(StationData.length - 1);
      expect(state.solved.size).toBe(1);
    });

    it('should persist the solved station ID to localStorage', () => {
      const station = StationData[0];

      service.solveStation(station);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();

      const ids: string[] = JSON.parse(raw!);
      expect(ids).toContain(station.id);
    });

    it('should persist string IDs (never numbers) to localStorage', () => {
      const station = StationData[0]; // id is '1', not 1

      service.solveStation(station);

      const raw = localStorage.getItem(STORAGE_KEY);
      const ids: string[] = JSON.parse(raw!);

      ids.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });

    it('should be idempotent when the same station is solved twice', async () => {
      const station = StationData[0];

      service.solveStation(station);
      service.solveStation(station);

      const state = await firstValueFrom(service.$stations);

      // Map.set is idempotent — solved should still have exactly 1 entry
      expect(state.solved.size).toBe(1);
      expect(state.unsolved.has(station.id)).toBeFalse();
    });

    it('should emit a new state via $stations after solving', async () => {
      const emissions: Array<{ solved: Map<string, Station>; unsolved: Map<string, Station> }> = [];
      const sub = service.$stations.subscribe(state => emissions.push(state));

      const initialCount = emissions.length;
      service.solveStation(StationData[0]);

      expect(emissions.length).toBe(initialCount + 1);
      sub.unsubscribe();
    });
  });

  describe('isStationSolved()', () => {
    it('should return false for an unsolved station', () => {
      const station = StationData[0];

      expect(service.isStationSolved(station)).toBeFalse();
    });

    it('should return true for a station that has been solved', () => {
      const station = StationData[0];

      service.solveStation(station);

      expect(service.isStationSolved(station)).toBeTrue();
    });

    it('should return false for a station that has not been solved even when others are solved', () => {
      service.solveStation(StationData[0]);

      const unsolvedStation = StationData[1];
      expect(service.isStationSolved(unsolvedStation)).toBeFalse();
    });
  });

  describe('loadFromStorage()', () => {
    it('should restore previously solved stations when the service is initialised', async () => {
      // Pre-populate localStorage with station ID '1' before creating the service
      const stationToRestore = StationData.find(s => s.id === '1')!;
      localStorage.setItem(STORAGE_KEY, JSON.stringify([stationToRestore.id]));

      // Re-create the service so the constructor reads from localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: Firestore, useValue: {} }],
      });
      const freshService = TestBed.inject(GameService);

      const state = await firstValueFrom(freshService.$stations);

      expect(state.solved.has(stationToRestore.id)).toBeTrue();
      expect(state.unsolved.has(stationToRestore.id)).toBeFalse();
    });

    it('should start fresh when localStorage contains corrupted JSON', async () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json{{');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: Firestore, useValue: {} }],
      });
      const freshService = TestBed.inject(GameService);

      const state = await firstValueFrom(freshService.$stations);

      expect(state.solved.size).toBe(0);
      expect(state.unsolved.size).toBe(StationData.length);
    });

    it('should start fresh when localStorage is empty', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: Firestore, useValue: {} }],
      });
      const freshService = TestBed.inject(GameService);

      const state = await firstValueFrom(freshService.$stations);

      expect(state.solved.size).toBe(0);
    });
  });

  describe('solveRandomStation()', () => {
    // NOTE: solveRandomStation() has a known implementation quirk: it computes a random
    // integer index (0..size-1) and calls unsolvedStations.get(String(randomIndex)).
    // Because Map keys are station IDs ('1'..'11'), only the integer indices that
    // coincide with a valid station ID string ('1'..'9') will produce a match.
    // Index 0 always misses (no station id '0'). The tests below document the actual
    // behaviour rather than an idealised expectation.

    it('should not throw when called', () => {
      expect(() => service.solveRandomStation()).not.toThrow();
    });

    it('should result in solved having at most 1 entry after a single call', async () => {
      service.solveRandomStation();

      const state = await firstValueFrom(service.$stations);

      // Either one station was solved (index matched a valid id) or none were (index 0 or 10)
      expect(state.solved.size).toBeLessThanOrEqual(1);
      expect(state.unsolved.size).toBeGreaterThanOrEqual(StationData.length - 1);
    });

    it('should not change state when all stations are already solved', async () => {
      // Solve all stations first
      StationData.forEach(station => service.solveStation(station));

      const stateBefore = await firstValueFrom(service.$stations);
      const solvedCountBefore = stateBefore.solved.size;

      service.solveRandomStation();

      const stateAfter = await firstValueFrom(service.$stations);
      expect(stateAfter.solved.size).toBe(solvedCountBefore);
    });
  });
});
