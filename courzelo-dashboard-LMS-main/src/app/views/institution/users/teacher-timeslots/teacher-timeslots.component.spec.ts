import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherTimeslotsComponent } from './teacher-timeslots.component';

describe('TeacherTimeslotsComponent', () => {
  let component: TeacherTimeslotsComponent;
  let fixture: ComponentFixture<TeacherTimeslotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherTimeslotsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherTimeslotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
