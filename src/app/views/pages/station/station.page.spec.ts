import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { convertToParamMap } from '@angular/router';

import { StationPage } from './station.page';

describe('StationPage', () => {
  let component: StationPage;
  let fixture: ComponentFixture<StationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        { provide: Firestore, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
