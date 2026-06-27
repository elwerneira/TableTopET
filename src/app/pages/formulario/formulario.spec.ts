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

  it('debe aceptar usuarios de 13 años o más', () => {
    const control = component.form.controls.fechaNacimiento;
    const birthDate = new Date();

    birthDate.setFullYear(birthDate.getFullYear() - 13);

    const value = [
      birthDate.getFullYear(),
      String(birthDate.getMonth() + 1).padStart(2, '0'),
      String(birthDate.getDate()).padStart(2, '0'),
    ].join('-');

    control.setValue(value);

    expect(control.valid).toBeTrue();
  });

  it('debe rechazar usuarios menores de 13 años', () => {
    const control = component.form.controls.fechaNacimiento;
    const birthDate = new Date();

    birthDate.setFullYear(birthDate.getFullYear() - 12);

    const value = [
      birthDate.getFullYear(),
      String(birthDate.getMonth() + 1).padStart(2, '0'),
      String(birthDate.getDate()).padStart(2, '0'),
    ].join('-');

    control.setValue(value);

    expect(control.hasError('minimumAge')).toBeTrue();
    expect(control.valid).toBeFalse();
  });

  it('debe marcar error cuando las contraseñas no coinciden', () => {
    component.form.controls.password.setValue('Clave123');
    component.form.controls.confirmarPassword.setValue('Otra123');

    expect(component.form.hasError('passwordMismatch')).toBeTrue();
    expect(component.form.valid).toBeFalse();
  });
});
