import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdJobDialogComponent } from './upd-job-dialog.component';

describe('UpdJobDialogComponent', () => {
  let component: UpdJobDialogComponent;
  let fixture: ComponentFixture<UpdJobDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdJobDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
