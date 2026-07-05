import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PokemonTcgCard } from '../../core/models/pokemon-tcg.models';
import { CartService } from '../../core/services/cart.service';
import { PokemonTcgApiService } from '../../core/services/pokemon-tcg-api.service';

/** Presenta productos Pokémon y un explorador conectado a Pokémon TCG API. */
@Component({
  selector: 'app-tcg',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tcg.html',
  styleUrl: './tcg.css',
})
export class Tcg {
  /** Servicio utilizado para agregar productos al carrito. */
  private readonly cart = inject(CartService);

  /** Enrutador utilizado cuando se requiere iniciar sesión. */
  private readonly router = inject(Router);

  /** Servicio que consulta cartas desde Pokémon TCG API. */
  private readonly pokemonApi = inject(PokemonTcgApiService);

  /** Permite finalizar solicitudes cuando el componente deja de existir. */
  private readonly destroyRef = inject(DestroyRef);

  /** Evita ejecutar solicitudes HTTP durante el prerenderizado del servidor. */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Campo reactivo utilizado para buscar cartas por nombre. */
  readonly searchControl = new FormControl('', { nonNullable: true });

  /** Formulario reactivo que evita la recarga nativa al ejecutar una búsqueda. */
  readonly searchForm = new FormGroup({
    query: this.searchControl,
  });

  /** Cartas obtenidas desde la API. */
  readonly cards = signal<PokemonTcgCard[]>([]);

  /** Indica si existe una solicitud en curso. */
  readonly loading = signal(false);

  /** Mensaje presentado cuando la consulta no puede completarse. */
  readonly apiError = signal('');

  /** Indica si el popup del explorador se encuentra abierto. */
  readonly explorerOpen = signal(false);

  /** Abre el popup y carga una selección inicial la primera vez. */
  openExplorer(): void {
    this.explorerOpen.set(true);
    if (this.isBrowser && !this.cards().length && !this.loading()) {
      this.loadCards();
    }
  }

  /** Cierra el popup del explorador de cartas. */
  closeExplorer(): void {
    this.explorerOpen.set(false);
  }

  /**
   * Cierra el popup cuando se selecciona directamente el fondo exterior.
   *
   * @param event Evento generado sobre la capa del popup.
   */
  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeExplorer();
    }
  }

  /** Permite cerrar el popup utilizando la tecla Escape. */
  @HostListener('document:keydown.escape')
  closeWithEscape(): void {
    if (this.explorerOpen()) {
      this.closeExplorer();
    }
  }

  /**
   * Agrega un producto TCG al carrito y redirige al login cuando corresponde.
   *
   * @param nombre Nombre del producto seleccionado.
   */
  agregarAlCarrito(nombre: string): void {
    const result = this.cart.addByName(nombre);
    alert(result.message);
    if (result.requiresLogin) {
      void this.router.navigate(['/login']);
    }
  }

  /** Ejecuta la búsqueda utilizando el valor actual del campo reactivo. */
  searchCards(): void {
    this.loadCards(this.searchControl.value);
  }

  /** Limpia el buscador y recupera nuevamente la selección inicial. */
  clearSearch(): void {
    this.searchControl.reset('');
    this.loadCards();
  }

  /**
   * Consulta la API y actualiza los estados visuales del explorador.
   *
   * @param searchText Nombre completo o parcial de una carta.
   */
  private loadCards(searchText = ''): void {
    if (!this.isBrowser) {
      return;
    }

    this.loading.set(true);
    this.apiError.set('');
    this.pokemonApi.searchCards(searchText)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: cards => this.cards.set(cards),
        error: (error: HttpErrorResponse) => {
          this.cards.set([]);
          this.apiError.set(
            error.status === 429
              ? 'Se alcanzó temporalmente el límite de consultas. Intenta nuevamente en unos minutos.'
              : 'No fue posible consultar las cartas Pokémon en este momento.',
          );
        },
      });
  }
}
