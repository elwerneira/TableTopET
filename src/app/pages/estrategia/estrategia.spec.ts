import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Estrategia } from './estrategia';

describe('Estrategia', () => {
  let component: Estrategia;
  let fixture: ComponentFixture<Estrategia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estrategia],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Estrategia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
