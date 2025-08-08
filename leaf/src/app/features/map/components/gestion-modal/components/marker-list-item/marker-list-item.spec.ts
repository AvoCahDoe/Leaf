import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerListItem } from './marker-list-item';

describe('MarkerListItem', () => {
  let component: MarkerListItem;
  let fixture: ComponentFixture<MarkerListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkerListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkerListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
