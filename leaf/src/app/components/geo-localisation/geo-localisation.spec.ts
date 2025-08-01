import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoLocalisation } from './geo-localisation';

describe('GeoLocalisation', () => {
  let component: GeoLocalisation;
  let fixture: ComponentFixture<GeoLocalisation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoLocalisation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoLocalisation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
