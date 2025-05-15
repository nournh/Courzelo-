import { TestBed } from '@angular/core/testing';

import { CandidateAppService } from './candidate-app.service';

describe('CandidateAppService', () => {
  let service: CandidateAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidateAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
