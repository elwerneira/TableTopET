import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

/**
 * Permite establecer una nueva contraseña mediante un formulario reactivo.
 */
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {
  /** Servicio encargado de actualizar la contraseña almacenada. */
  private readonly auth = inject(AuthService);

  /** Constructor del formulario reactivo. */
  private readonly formBuilder = inject(FormBuilder);

  /** Enrutador utilizado al terminar la recuperación. */
  private readonly router = inject(Router);

  /** Mensaje con el resultado de la operación. */
  readonly feedback = signal('');

  /** Indica si el mensaje actual representa un error. */
  readonly feedbackError = signal(false);

  /** Controla la visibilidad de la nueva contraseña. */
  readonly passwordVisible = signal(false);

  /** Controla la visibilidad de la confirmación de contraseña. */
  readonly confirmPasswordVisible = signal(false);

  /** Formulario reactivo de recuperación con validación de coincidencia. */
  readonly form = this.formBuilder.nonNullable.group(
    {
      identifier: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') },
  );

  /**
   * Valida los datos y solicita la actualización de contraseña.
   *
   * @returns No retorna un valor; actualiza el mensaje y puede navegar al login.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showFeedback('Revisa los campos marcados antes de continuar.', true);
      return;
    }

    const result = this.auth.updatePassword(this.form.controls.identifier.value, this.form.controls.password.value);
    this.showFeedback(result.message, !result.ok);
    if (result.ok) {
      void this.router.navigate(['/login']);
    }
  }

  /** Limpia todos los campos y mensajes del formulario. */
  reset(): void {
    this.form.reset();
    this.showFeedback('', false);
  }

  /**
   * Actualiza la retroalimentación presentada al usuario.
   *
   * @param message Mensaje que debe mostrarse.
   * @param error Indica si el resultado corresponde a un error.
   */
  private showFeedback(message: string, error: boolean): void {
    this.feedback.set(message);
    this.feedbackError.set(error);
  }
}
