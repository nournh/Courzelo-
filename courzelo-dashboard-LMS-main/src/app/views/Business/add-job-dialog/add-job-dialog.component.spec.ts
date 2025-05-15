import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobDialogComponent } from './add-job-dialog.component';

describe('AddJobDialogComponent', () => {
  let component: AddJobDialogComponent;
  let fixture: ComponentFixture<AddJobDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddJobDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
