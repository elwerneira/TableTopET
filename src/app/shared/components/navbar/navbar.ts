import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/** Barra de navegación principal adaptada al estado de autenticación del usuario. */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  /** Servicio de autenticación expuesto para adaptar las opciones del menú. */
  readonly auth = inject(AuthService);

  /** Indica si el menú móvil se encuentra desplegado. */
  readonly menuOpen = signal(false);

  /** Indica si el listado de categorías se encuentra desplegado. */
  readonly categoriesOpen = signal(false);

  /** Enrutador utilizado después de cerrar la sesión. */
  private readonly router = inject(Router);

  /** Cierra el menú principal y el listado de categorías. */
  closeMenu(): void {
    this.menuOpen.set(false);
    this.categoriesOpen.set(false);
  }

  /** Alterna el estado visible del menú principal. */
  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
    if (!this.menuOpen()) {
      this.categoriesOpen.set(false);
    }
  }

  /**
   * Alterna el listado de categorías sin ejecutar la navegación del enlace.
   *
   * @param event Evento originado al seleccionar el control de categorías.
   */
  toggleCategories(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.categoriesOpen.update((value) => !value);
  }

  /** Cierra la sesión, contrae el menú y navega a la página principal. */
  logout(): void {
    this.auth.logout();
    this.closeMenu();
    void this.router.navigate(['/']);
  }

  /** Cierra el listado de categorías cuando se hace clic fuera del menú. */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.categoriesOpen.set(false);
  }
}
