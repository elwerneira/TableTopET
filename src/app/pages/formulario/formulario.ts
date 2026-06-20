import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly feedback = signal('');
  readonly feedbackError = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);
  readonly form = this.formBuilder.nonNullable.group(
    {
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmarPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion: [''],
    },
    { validators: passwordMatchValidator('password', 'confirmarPassword') },
  );

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

  reset(): void {
    this.form.reset();
    this.showFeedback('', false);
  }

  private showFeedback(message: string, error: boolean): void {
    this.feedback.set(message);
    this.feedbackError.set(error);
  }
}
