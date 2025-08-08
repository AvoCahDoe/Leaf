import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualGeoModal } from './manual-geo-modal';

describe('ManualGeoModal', () => {
  let component: ManualGeoModal;
  let fixture: ComponentFixture<ManualGeoModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualGeoModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualGeoModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
