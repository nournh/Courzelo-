import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadPostViewComponent } from './thread-post-view.component';

describe('ThreadPostViewComponent', () => {
  let component: ThreadPostViewComponent;
  let fixture: ComponentFixture<ThreadPostViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreadPostViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadPostViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
