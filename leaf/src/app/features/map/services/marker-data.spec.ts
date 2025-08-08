import { TestBed } from '@angular/core/testing';

import { MarkerData } from './marker-data';

describe('MarkerData', () => {
  let service: MarkerData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkerData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
