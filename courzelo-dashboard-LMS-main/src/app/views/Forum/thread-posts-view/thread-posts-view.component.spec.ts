import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadPostsViewComponent } from './thread-posts-view.component';

describe('ThreadPostsViewComponent', () => {
  let component: ThreadPostsViewComponent;
  let fixture: ComponentFixture<ThreadPostsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreadPostsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadPostsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
