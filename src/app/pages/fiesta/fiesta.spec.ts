import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Fiesta } from './fiesta';

describe('Fiesta', () => {
  let component: Fiesta;
  let fixture: ComponentFixture<Fiesta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fiesta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Fiesta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
