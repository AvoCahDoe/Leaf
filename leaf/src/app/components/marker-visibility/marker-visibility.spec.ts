import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerVisibility } from './marker-visibility';

describe('MarkerVisibility', () => {
  let component: MarkerVisibility;
  let fixture: ComponentFixture<MarkerVisibility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkerVisibility]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkerVisibility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
