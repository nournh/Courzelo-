import { TestBed } from '@angular/core/testing';

import { PrehiringtestsService } from './prehiringtests.service';

describe('PrehiringtestsService', () => {
  let service: PrehiringtestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrehiringtestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
