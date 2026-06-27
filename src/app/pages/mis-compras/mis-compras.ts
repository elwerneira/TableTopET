import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { PurchaseService } from '../../core/services/purchase.service';

/** Presenta el historial de compras perteneciente al usuario autenticado. */
@Component({
  selector: 'app-mis-compras',
  imports: [RouterLink],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisCompras implements OnInit {
  /** Servicio de compras expuesto para construir el historial. */
  readonly purchaseService = inject(PurchaseService);

  /** Indica si la página fue abierta después de confirmar una compra. */
  readonly purchaseSuccess = inject(ActivatedRoute).snapshot.queryParamMap.get('compra') === 'exitosa';

  /** Servicio utilizado para comprobar la sesión activa. */
  private readonly auth = inject(AuthService);

  /** Enrutador utilizado para proteger el historial. */
  private readonly router = inject(Router);

  /** Protege la página y carga las compras asociadas al usuario actual. */
  ngOnInit(): void {
    if (!this.auth.session()) {
      void this.router.navigate(['/login']);
      return;
    }
    this.purchaseService.refresh();
  }

  /**
   * Formatea un monto utilizando la configuración regional chilena.
   *
   * @param value Monto que debe formatearse.
   * @returns Precio preparado para la interfaz.
   */
  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  /**
   * Convierte una fecha ISO al formato local de Chile.
   *
   * @param value Fecha almacenada en formato de texto.
   * @returns Fecha y hora preparadas para la interfaz.
   */
  formatDate(value: string): string {
    return new Date(value).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  /**
   * Suma las unidades contenidas en el detalle de una compra.
   *
   * @param items Elementos cuyo campo `cantidad` debe sumarse.
   * @returns Cantidad total de unidades compradas.
   */
  itemQuantity(items: { cantidad: number }[]): number {
    return items.reduce((total, item) => total + item.cantidad, 0);
  }
}
