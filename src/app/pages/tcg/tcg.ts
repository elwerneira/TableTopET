import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

/** Presenta productos relacionados con juegos de cartas coleccionables. */
@Component({
  selector: 'app-tcg',
  imports: [RouterLink],
  templateUrl: './tcg.html',
  styleUrl: './tcg.css',
})
export class Tcg {
  /** Servicio utilizado para agregar productos al carrito. */
  private readonly cart = inject(CartService);

  /** Enrutador utilizado cuando se requiere iniciar sesión. */
  private readonly router = inject(Router);

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
}
