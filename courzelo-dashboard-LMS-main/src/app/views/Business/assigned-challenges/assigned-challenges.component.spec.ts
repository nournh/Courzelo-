import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedChallengesComponent } from './assigned-challenges.component';

describe('AssignedChallengesComponent', () => {
  let component: AssignedChallengesComponent;
  let fixture: ComponentFixture<AssignedChallengesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedChallengesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedChallengesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
