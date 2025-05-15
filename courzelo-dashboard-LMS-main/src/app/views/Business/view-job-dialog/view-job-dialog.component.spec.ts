import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJobDialogComponent } from './view-job-dialog.component';

describe('ViewJobDialogComponent', () => {
  let component: ViewJobDialogComponent;
  let fixture: ComponentFixture<ViewJobDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewJobDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
