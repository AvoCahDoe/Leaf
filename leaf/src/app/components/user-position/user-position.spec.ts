import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPosition } from './user-position';

describe('UserPosition', () => {
  let component: UserPosition;
  let fixture: ComponentFixture<UserPosition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPosition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPosition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
