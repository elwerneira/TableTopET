import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

/**
 * Gestiona el inicio de sesión mediante un formulario reactivo.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /** Servicio utilizado para validar las credenciales. */
  private readonly auth = inject(AuthService);

  /** Constructor del formulario reactivo. */
  private readonly formBuilder = inject(FormBuilder);

  /** Enrutador utilizado después de autenticar al usuario. */
  private readonly router = inject(Router);

  /** Mensaje con el resultado del inicio de sesión. */
  readonly feedback = signal('');

  /** Indica si el mensaje actual corresponde a un error. */
  readonly feedbackError = signal(false);

  /** Controla si la contraseña se muestra como texto. */
  readonly passwordVisible = signal(false);

  /** Formulario reactivo con identificador y contraseña obligatorios. */
  readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
  });

  /**
   * Valida el formulario, solicita la autenticación y navega al inicio.
   *
   * @returns No retorna un valor; actualiza el mensaje y puede ejecutar navegación.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showFeedback('Completa los campos para continuar.', true);
      return;
    }

    const result = this.auth.login(this.form.controls.identifier.value, this.form.controls.password.value);
    this.showFeedback(result.message, !result.ok);
    if (result.ok) {
      void this.router.navigate(['/']);
    }
  }

  /**
   * Actualiza la retroalimentación presentada por el formulario.
   *
   * @param message Mensaje que debe mostrarse.
   * @param error Indica si se trata de un resultado fallido.
   */
  private showFeedback(message: string, error: boolean): void {
    this.feedback.set(message);
    this.feedbackError.set(error);
  }
}
