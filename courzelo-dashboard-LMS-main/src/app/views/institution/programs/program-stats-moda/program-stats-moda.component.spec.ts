import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramStatsModaComponent } from './program-stats-moda.component';

describe('ProgramStatsModaComponent', () => {
  let component: ProgramStatsModaComponent;
  let fixture: ComponentFixture<ProgramStatsModaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramStatsModaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramStatsModaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
