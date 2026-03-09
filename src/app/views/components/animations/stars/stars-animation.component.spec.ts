import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StarsAnimationComponent } from './stars-animation.component';

describe('StarsAnimationComponent', () => {
  let component: StarsAnimationComponent;
  let fixture: ComponentFixture<StarsAnimationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StarsAnimationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StarsAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
