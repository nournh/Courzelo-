import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCoursePartsComponent } from './view-course-parts.component';

describe('ViewModulePartsComponent', () => {
  let component: ViewCoursePartsComponent;
  let fixture: ComponentFixture<ViewCoursePartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCoursePartsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCoursePartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
