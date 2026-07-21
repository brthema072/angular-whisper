import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whisper } from './whisper';

describe('Whisper', () => {
  let component: Whisper;
  let fixture: ComponentFixture<Whisper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whisper],
    }).compileComponents();

    fixture = TestBed.createComponent(Whisper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
