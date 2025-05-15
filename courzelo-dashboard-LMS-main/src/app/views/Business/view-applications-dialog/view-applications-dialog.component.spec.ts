import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewApplicationsDialogComponent } from './view-applications-dialog.component';

describe('ViewApplicationsDialogComponent', () => {
  let component: ViewApplicationsDialogComponent;
  let fixture: ComponentFixture<ViewApplicationsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewApplicationsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewApplicationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
