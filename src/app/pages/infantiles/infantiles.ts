import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../core/models/store.models';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CatalogFilter } from '../../shared/components/catalog-filter/catalog-filter';

/**
 * Presenta los juegos infantiles y permite buscarlos antes de agregarlos al carrito.
 */
@Component({
  selector: 'app-infantiles',
  imports: [CatalogFilter, RouterLink],
  templateUrl: './infantiles.html',
  styleUrl: './infantiles.css',
})
export class Infantiles {
  /** Servicio que administra los productos agregados al carrito. */
  private readonly cart = inject(CartService);

  private readonly catalog = inject(CatalogService);

  /** Enrutador utilizado cuando la operación requiere iniciar sesión. */
  private readonly router = inject(Router);

  readonly products = computed(() =>
    this.catalog.products().filter(product =>
      product.categoria === 'Infantiles'
      && product.estado === 'activo'
      && this.matchesSearch(product.nombre),
    ),
  );

  /** Término recibido desde el componente hijo de búsqueda. */
  searchTerm = '';

  /**
   * Actualiza el término utilizado para filtrar las tarjetas.
   *
   * @param query Texto emitido por el componente `CatalogFilter`.
   */
  updateSearch(query: string): void {
    this.searchTerm = query;
  }

  /**
   * Indica si un juego coincide con el término de búsqueda actual.
   *
   * @param name Nombre del juego evaluado.
   * @returns `true` cuando la tarjeta debe permanecer visible.
   */
  matchesSearch(name: string): boolean {
    return this.normalize(name).includes(this.normalize(this.searchTerm));
  }

  hasOffer(product: Product): boolean {
    return Boolean(product.precioOriginal && product.precioOriginal > product.precio) || Boolean(product.oferta);
  }

  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  /**
   * Agrega un juego al carrito o redirige al inicio de sesión cuando corresponde.
   *
   * @param nombre Nombre del juego seleccionado.
   */
  agregarAlCarrito(nombre: string): void {
    const result = this.cart.addByName(nombre);
    alert(result.message);
    if (result.requiresLogin) {
      void this.router.navigate(['/login']);
    }
  }

  /**
   * Normaliza un texto para realizar búsquedas sin distinguir tildes o mayúsculas.
   *
   * @param value Texto que será normalizado.
   * @returns Texto preparado para comparación.
   */
  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
