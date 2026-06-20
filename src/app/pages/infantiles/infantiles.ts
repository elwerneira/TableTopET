import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-infantiles',
  imports: [RouterLink],
  templateUrl: './infantiles.html',
  styleUrl: './infantiles.css',
})
export class Infantiles {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  agregarAlCarrito(nombre: string): void {
    const result = this.cart.addByName(nombre);
    alert(result.message);
    if (result.requiresLogin) {
      void this.router.navigate(['/login']);
    }
  }
}
