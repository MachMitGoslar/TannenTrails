import { TestBed } from '@angular/core/testing';
import { Position } from '@capacitor/geolocation';

import { LocationService } from './location-service';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationService);
  });

  afterEach(() => jasmine.clock().uninstall());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shares one mock watcher and stops it when the last subscriber leaves', () => {
    const emitted: (Position | null)[] = [];
    const probe = service.my_position$.subscribe(p => emitted.push(p));

    const first = service.watchPosition(true).subscribe();
    const second = service.watchPosition(true).subscribe();

    jasmine.clock().tick(800);
    // initial null + exactly one tick from a single shared interval
    expect(emitted.length).toBe(2);

    first.unsubscribe();
    jasmine.clock().tick(800);
    expect(emitted.length).toBe(3);

    second.unsubscribe();
    jasmine.clock().tick(1600);
    expect(emitted.length).toBe(3);

    probe.unsubscribe();
  });

  it('converts headings to compass directions', () => {
    expect(service.degreesToCompass(0)).toBe('N');
    expect(service.degreesToCompass(90)).toBe('O');
    expect(service.degreesToCompass(-90)).toBe('W');
    expect(service.degreesToCompass(null)).toBe('Unknown');
  });
});
