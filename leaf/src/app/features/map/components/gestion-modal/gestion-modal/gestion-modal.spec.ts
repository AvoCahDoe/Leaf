import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionModal } from './gestion-modal';

describe('GestionModal', () => {
  let component: GestionModal;
  let fixture: ComponentFixture<GestionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
