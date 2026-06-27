import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Crea un validador para verificar que la fecha de nacimiento cumpla una edad mínima.
 *
 * Si el campo está vacío no devuelve error, porque la obligatoriedad se controla con
 * Validators.required. Cuando la fecha ingresada no alcanza la edad mínima, devuelve
 * el error minimumAge.
 *
 * @param minimumAge Edad mínima requerida.
 * @returns Validador compatible con formularios reactivos de Angular.
 */
export function minimumAgeValidator(minimumAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const minimumBirthDate = new Date(
      today.getFullYear() - minimumAge,
      today.getMonth(),
      today.getDate(),
    );

    return birthDate <= minimumBirthDate
      ? null
      : {
          minimumAge: {
            requiredAge: minimumAge,
          },
        };
  };
}
