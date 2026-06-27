import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

import { minimumAgeValidator } from '../../shared/validators/minimum-age.validator';

/**
 * Componente de registro de usuarios.
 *
 * Administra el formulario reactivo de creación de cuenta, incluyendo
 * validaciones de campos obligatorios, correo electrónico, fortaleza de
 * contraseña, confirmación de contraseña y edad mínima de registro.
 */
@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  /** Servicio encargado de registrar la cuenta. */
  private readonly auth = inject(AuthService);

  /** Constructor de formularios reactivos. */
  private readonly formBuilder = inject(FormBuilder);

  /** Enrutador utilizado después de un registro exitoso. */
  private readonly router = inject(Router);

  /** Mensaje de resultado visible para el usuario. */
  readonly feedback = signal('');

  /** Indica si el mensaje de resultado representa un error. */
  readonly feedbackError = signal(false);

  /** Controla la visibilidad del campo de contraseña. */
  readonly passwordVisible = signal(false);

  /** Controla la visibilidad de la confirmación de contraseña. */
  readonly confirmPasswordVisible = signal(false);

  /**
   * Formulario reactivo principal del registro.
   *
   * La fecha de nacimiento exige una edad mínima de 13 años y la contraseña
   * debe coincidir con su campo de confirmación.
   */
  readonly form = this.formBuilder.nonNullable.group(
    {
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmarPassword: ['', Validators.required],
      fechaNacimiento: [
        '',
        [Validators.required, minimumAgeValidator(13)],
      ],
      direccion: [''],
    },
    { validators: passwordMatchValidator('password', 'confirmarPassword') },
  );

  /**
   * Envía el formulario de registro cuando los datos son válidos.
   *
   * Si el formulario contiene errores, marca todos los campos como tocados
   * para mostrar sus mensajes de validación al usuario.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showFeedback('Revisa los campos marcados antes de continuar.', true);
      return;
    }

    const { confirmarPassword: _, ...user } = this.form.getRawValue();
    const result = this.auth.register(user);
    this.showFeedback(result.message, !result.ok);
    if (result.ok) {
      void this.router.navigate(['/']);
    }
  }

  /**
   * Limpia el formulario y reinicia los mensajes de retroalimentación.
   */
  reset(): void {
    this.form.reset();
    this.showFeedback('', false);
  }

  /**
   * Actualiza el mensaje mostrado después de validar o enviar el formulario.
   *
   * @param message Texto que se mostrará al usuario.
   * @param error Indica si el mensaje debe presentarse como error.
   */
  private showFeedback(message: string, error: boolean): void {
    this.feedback.set(message);
    this.feedbackError.set(error);
  }
}
