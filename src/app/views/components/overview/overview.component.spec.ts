import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { Position } from '@capacitor/geolocation';
import { ProgressModalService } from 'src/app/core/services/progress-modal.service';
import { LocationService } from 'src/app/core/services/location-service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    // Stub GPS so no real or mock watcher (setInterval) keeps the test zone busy
    const locationStub: Partial<LocationService> = {
      my_position$: new BehaviorSubject<Position | null>(null),
      watchPosition: () => of(null),
      setupDistanceObserver: () => NEVER,
    };

    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        provideRouter([]),
        { provide: Firestore, useValue: {} },
        { provide: LocationService, useValue: locationStub },
        {
          provide: ProgressModalService,
          useValue: {
            openProgressModal: jasmine
              .createSpy('openProgressModal')
              .and.returnValue(Promise.resolve()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
