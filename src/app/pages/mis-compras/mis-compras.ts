import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { PurchaseService } from '../../core/services/purchase.service';

@Component({
  selector: 'app-mis-compras',
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisCompras implements OnInit {
  readonly purchaseService = inject(PurchaseService);
  readonly purchaseSuccess = inject(ActivatedRoute).snapshot.queryParamMap.get('compra') === 'exitosa';

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.session()) {
      void this.router.navigate(['/login']);
      return;
    }
    this.purchaseService.refresh();
  }

  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  itemQuantity(items: { cantidad: number }[]): number {
    return items.reduce((total, item) => total + item.cantidad, 0);
  }
}
