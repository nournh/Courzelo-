import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayChallengesComponent } from './display-challenges.component';

describe('DisplayChallengesComponent', () => {
  let component: DisplayChallengesComponent;
  let fixture: ComponentFixture<DisplayChallengesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayChallengesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayChallengesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
