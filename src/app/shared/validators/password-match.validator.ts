import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Crea un validador de grupo para comprobar que dos campos de contraseña coincidan.
 *
 * Se utiliza en formularios reactivos donde existe un campo de contraseña y otro
 * campo de confirmación. Cuando los valores son distintos, devuelve el error
 * passwordMismatch.
 *
 * @param passwordField Nombre del control que contiene la contraseña principal.
 * @param confirmationField Nombre del control que contiene la confirmación.
 * @returns Validador compatible con un FormGroup de Angular.
 */
export function passwordMatchValidator(passwordField: string, confirmationField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value;
    const confirmation = control.get(confirmationField)?.value;

    return password === confirmation ? null : { passwordMismatch: true };
  };
}
