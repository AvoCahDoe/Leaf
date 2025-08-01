import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerFilter } from './marker-filter';

describe('MarkerFilter', () => {
  let component: MarkerFilter;
  let fixture: ComponentFixture<MarkerFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkerFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkerFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
