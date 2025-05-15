import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTestDialogComponent } from './assign-test-dialog.component';

describe('AssignTestDialogComponent', () => {
  let component: AssignTestDialogComponent;
  let fixture: ComponentFixture<AssignTestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTestDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
