import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Familiares } from './familiares';

describe('Familiares', () => {
  let component: Familiares;
  let fixture: ComponentFixture<Familiares>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Familiares],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Familiares);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
