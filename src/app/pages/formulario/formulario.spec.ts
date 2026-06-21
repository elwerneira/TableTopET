import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Formulario } from './formulario';

describe('Formulario', () => {
  let component: Formulario;
  let fixture: ComponentFixture<Formulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formulario],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Formulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe iniciar con todos sus campos vacíos', () => {
    expect(component.form.getRawValue()).toEqual({
      nombre: '',
      usuario: '',
      correo: '',
      password: '',
      confirmarPassword: '',
      fechaNacimiento: '',
      direccion: '',
    });
  });

  it('debe aplicar la validación required a los campos obligatorios', () => {
    const requiredControls = [
      component.form.controls.nombre,
      component.form.controls.usuario,
      component.form.controls.correo,
      component.form.controls.password,
      component.form.controls.confirmarPassword,
      component.form.controls.fechaNacimiento,
    ];

    requiredControls.forEach((control) => {
      expect(control.hasError('required')).toBeTrue();
    });
    expect(component.form.controls.direccion.hasError('required')).toBeFalse();
    expect(component.form.invalid).toBeTrue();
  });
});
