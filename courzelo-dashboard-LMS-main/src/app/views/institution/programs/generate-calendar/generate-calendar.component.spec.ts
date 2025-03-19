import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCalendarComponent } from './generate-calendar.component';

describe('GenerateCalendarComponent', () => {
  let component: GenerateCalendarComponent;
  let fixture: ComponentFixture<GenerateCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
