import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly categoriesOpen = signal(false);

  private readonly router = inject(Router);

  closeMenu(): void {
    this.menuOpen.set(false);
    this.categoriesOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
    if (!this.menuOpen()) {
      this.categoriesOpen.set(false);
    }
  }

  toggleCategories(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.categoriesOpen.update((value) => !value);
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    void this.router.navigate(['/']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.categoriesOpen.set(false);
  }
}
