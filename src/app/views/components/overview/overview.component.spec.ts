import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { ProgressModalService } from 'src/app/core/services/progress-modal.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        provideRouter([]),
        { provide: Firestore, useValue: {} },
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
