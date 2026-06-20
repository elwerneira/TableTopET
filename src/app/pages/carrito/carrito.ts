import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  readonly cart = inject(CartService);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.session()) {
      void this.router.navigate(['/login']);
      return;
    }
    this.cart.refresh();
  }

  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  checkout(): void {
    const result = this.cart.checkout();
    if (!result.ok) {
      alert(result.message);
      return;
    }
    void this.router.navigate(['/mis-compras'], { queryParams: { compra: 'exitosa' } });
  }
}
