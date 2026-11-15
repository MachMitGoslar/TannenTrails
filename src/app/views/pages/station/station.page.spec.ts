import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { convertToParamMap } from '@angular/router';

import { StationPage } from './station.page';
import { StationData } from 'src/app/core/models/dataset';

describe('StationPage', () => {
  let component: StationPage;
  let fixture: ComponentFixture<StationPage>;

  async function createWithId(id: string) {
    await TestBed.configureTestingModule({
      imports: [StationPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
        { provide: Firestore, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await createWithId('1');
    expect(component).toBeTruthy();
    expect(component.station?.id).toBe('1');
  });

  it('does not mutate the shared station dataset', async () => {
    await createWithId('1');
    const shared = StationData.find(s => s.id === '1')!;
    expect(component.station).not.toBe(shared);
  });

  it('shows a not-found state for unknown station ids', async () => {
    await createWithId('does-not-exist');
    expect(component.station).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('Station nicht gefunden');
  });
});
