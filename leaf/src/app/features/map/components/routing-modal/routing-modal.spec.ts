import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingModal } from './routing-modal';

describe('RoutingModal', () => {
  let component: RoutingModal;
  let fixture: ComponentFixture<RoutingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
