import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

/** Presenta el carrito del usuario y permite confirmar la compra. */
@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  /** Servicio del carrito expuesto para construir la vista. */
  readonly cart = inject(CartService);

  /** Servicio utilizado para comprobar la sesión activa. */
  private readonly auth = inject(AuthService);

  /** Enrutador utilizado para proteger la página y finalizar la compra. */
  private readonly router = inject(Router);

  /** Protege la página y carga el carrito correspondiente al usuario. */
  ngOnInit(): void {
    if (!this.auth.session()) {
      void this.router.navigate(['/login']);
      return;
    }
    this.cart.refresh();
  }

  /**
   * Formatea un valor monetario para Chile.
   *
   * @param value Monto que debe formatearse.
   * @returns Precio representado en formato local.
   */
  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  /** Confirma el carrito y navega al historial cuando la compra es exitosa. */
  checkout(): void {
    const result = this.cart.checkout();
    if (!result.ok) {
      alert(result.message);
      return;
    }
    void this.router.navigate(['/mis-compras'], { queryParams: { compra: 'exitosa' } });
  }
}
