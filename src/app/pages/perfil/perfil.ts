import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '../../core/models/store.models';
import { AuthService } from '../../core/services/auth.service';
import { minimumAgeValidator } from '../../shared/validators/minimum-age.validator';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

/** Página que carga y actualiza los datos del usuario autenticado. */
@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  /** Servicio responsable de consultar y actualizar la cuenta. */
  private readonly auth = inject(AuthService);

  /** Constructor utilizado para definir el formulario reactivo. */
  private readonly formBuilder = inject(FormBuilder);

  /** Enrutador utilizado para proteger la página. */
  private readonly router = inject(Router);

  /** Usuario cargado originalmente desde el almacenamiento. */
  private currentUser: User | null = null;

  /** Mensaje generado al validar o guardar el perfil. */
  readonly feedback = signal('');

  /** Indica si el mensaje actual corresponde a un error. */
  readonly feedbackError = signal(false);

  /** Controla la visibilidad de la nueva contraseña. */
  readonly passwordVisible = signal(false);

  /** Controla la visibilidad de la confirmación de contraseña. */
  readonly confirmPasswordVisible = signal(false);

  /** Indica que el nombre de usuario administrador debe permanecer fijo. */
  readonly primaryAdmin = signal(false);

  /** Formulario reactivo utilizado para editar el perfil. */
  readonly form = this.formBuilder.nonNullable.group(
    {
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, minimumAgeValidator(13)]],
      direccion: [''],
      password: ['', [Validators.minLength(6), Validators.maxLength(18), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmarPassword: [''],
    },
    { validators: passwordMatchValidator('password', 'confirmarPassword') },
  );

  /** Protege la página y carga los datos del usuario activo. */
  ngOnInit(): void {
    const session = this.auth.session();
    if (!session) {
      void this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.findUser(session.usuario);
    if (!user) {
      this.auth.logout();
      void this.router.navigate(['/login']);
      return;
    }

    this.currentUser = user;
    this.primaryAdmin.set(user.usuario.toLowerCase() === 'admin');
    this.restoreForm(user);
  }

  /** Valida y guarda los cambios realizados sobre el perfil. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showFeedback('Revisa los campos marcados antes de guardar.', true);
      return;
    }

    const { confirmarPassword: _, ...changes } = this.form.getRawValue();
    const result = this.auth.updateProfile(changes);
    this.showFeedback(result.message, !result.ok);
    if (result.ok) {
      const session = this.auth.session();
      this.currentUser = session ? this.auth.findUser(session.usuario) ?? null : null;
      this.form.controls.password.reset('');
      this.form.controls.confirmarPassword.reset('');
      this.form.markAsPristine();
    }
  }

  /** Restablece los datos almacenados y limpia los mensajes del formulario. */
  reset(): void {
    if (this.currentUser) {
      this.restoreForm(this.currentUser);
    }
    this.showFeedback('', false);
  }

  /**
   * Carga un usuario dentro del formulario sin incluir su contraseña almacenada.
   *
   * @param user Usuario cuyos datos deben presentarse.
   */
  private restoreForm(user: User): void {
    this.form.reset({
      nombre: user.nombre,
      usuario: user.usuario,
      correo: user.correo,
      fechaNacimiento: user.fechaNacimiento ?? '',
      direccion: user.direccion ?? '',
      password: '',
      confirmarPassword: '',
    });
  }

  /**
   * Actualiza el mensaje presentado debajo del formulario.
   *
   * @param message Texto que debe mostrarse.
   * @param error Indica si el resultado representa un error.
   */
  private showFeedback(message: string, error: boolean): void {
    this.feedback.set(message);
    this.feedbackError.set(error);
  }
}
