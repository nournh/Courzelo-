import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupBComponent } from './signup-b.component';

describe('SignupBComponent', () => {
  let component: SignupBComponent;
  let fixture: ComponentFixture<SignupBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupBComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
