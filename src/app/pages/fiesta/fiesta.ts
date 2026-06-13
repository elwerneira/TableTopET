import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-fiesta',
  templateUrl: './fiesta.html',
  styleUrl: './fiesta.css',
})
export class Fiesta {
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
