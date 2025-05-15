import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyChallengesComponent } from './my-challenges.component';

describe('MyChallengesComponent', () => {
  let component: MyChallengesComponent;
  let fixture: ComponentFixture<MyChallengesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyChallengesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyChallengesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
