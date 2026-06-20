import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly feedback = signal('');
  readonly feedbackError = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);
  readonly form = this.formBuilder.nonNullable.group(
    {
      identifier: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') },
  );

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

  reset(): void {
    this.form.reset();
    this.showFeedback('', false);
  }

  private showFeedback(message: string, error: boolean): void {
    this.feedback.set(message);
    this.feedbackError.set(error);
  }
}
