import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

/** Presenta los juegos de estrategia disponibles para compra. */
@Component({
  selector: 'app-estrategia',
  imports: [RouterLink],
  templateUrl: './estrategia.html',
  styleUrl: './estrategia.css',
})
export class Estrategia {
  /** Servicio utilizado para agregar productos al carrito. */
  private readonly cart = inject(CartService);

  /** Enrutador utilizado cuando se requiere iniciar sesión. */
  private readonly router = inject(Router);

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
