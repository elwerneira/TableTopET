import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { MisCompras } from './mis-compras';

describe('MisCompras', () => {
  let component: MisCompras;
  let fixture: ComponentFixture<MisCompras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisCompras],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            session: () => ({ nombre: 'Test', usuario: 'test', correo: 'test@example.com', rol: 'cliente' }),
            userKey: () => 'test',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MisCompras);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
