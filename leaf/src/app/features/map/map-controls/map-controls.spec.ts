import { TestBed } from '@angular/core/testing';

import { MapControls } from './map-controls';

describe('MapControls', () => {
  let service: MapControls;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapControls);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
