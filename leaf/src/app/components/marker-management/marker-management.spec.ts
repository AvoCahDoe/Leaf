import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerManagement } from './marker-management';

describe('MarkerManagement', () => {
  let component: MarkerManagement;
  let fixture: ComponentFixture<MarkerManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkerManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkerManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
