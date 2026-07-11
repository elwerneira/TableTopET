import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../core/models/store.models';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';

/** Presenta los juegos de fiesta disponibles para compra. */
@Component({
  selector: 'app-fiesta',
  imports: [RouterLink],
  templateUrl: './fiesta.html',
  styleUrl: './fiesta.css',
})
export class Fiesta {
  /** Servicio utilizado para agregar productos al carrito. */
  private readonly cart = inject(CartService);

  private readonly catalog = inject(CatalogService);

  /** Enrutador utilizado cuando se requiere iniciar sesión. */
  private readonly router = inject(Router);

  readonly products = computed(() =>
    this.catalog.products().filter(product => product.categoria === 'Fiesta' && product.estado === 'activo'),
  );

  hasOffer(product: Product): boolean {
    return Boolean(product.precioOriginal && product.precioOriginal > product.precio) || Boolean(product.oferta);
  }

  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  /**
   * Agrega un juego al carrito y gestiona una eventual redirección al login.
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
}
