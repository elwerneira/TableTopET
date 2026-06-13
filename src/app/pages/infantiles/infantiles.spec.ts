import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Infantiles } from './infantiles';

describe('Infantiles', () => {
  let component: Infantiles;
  let fixture: ComponentFixture<Infantiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Infantiles],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Infantiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
