import { TestBed } from '@angular/core/testing';

import { ElementModuleService } from './element-module.service';

describe('ElementModuleService', () => {
  let service: ElementModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
