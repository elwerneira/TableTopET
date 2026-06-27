import { inject, Injectable, signal } from '@angular/core';

import { CartItem, Purchase } from '../models/store.models';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';

/** Prefijo utilizado para separar el historial de cada usuario. */
const STORAGE_PURCHASES_PREFIX = 'tabletop_purchases_';

/**
 * Registra y consulta el historial de compras del usuario autenticado.
 */
@Injectable({ providedIn: 'root' })
export class PurchaseService {
  /** Servicio utilizado para identificar al usuario activo. */
  private readonly auth = inject(AuthService);

  /** Acceso seguro al almacenamiento local del navegador. */
  private readonly storage = inject(BrowserStorageService);

  /** Estado interno mutable del historial de compras. */
  private readonly purchasesState = signal<Purchase[]>(this.load());

  /** Historial de compras publicado como estado de solo lectura. */
  readonly purchases = this.purchasesState.asReadonly();

  /**
   * Crea una compra a partir de los productos del carrito actual.
   *
   * @param items Productos, precios y cantidades incluidos en la compra.
   * @returns Compra registrada o `null` cuando no existe un usuario autenticado.
   */
  add(items: CartItem[]): Purchase | null {
    const key = this.storageKey();
    if (!key) {
      return null;
    }

    const purchase: Purchase = {
      id: `COMP-${Date.now()}`,
      fecha: new Date().toISOString(),
      estado: 'Confirmada',
      total: items.reduce((total, item) => total + item.precio * item.cantidad, 0),
      items: items.map(item => ({ ...item })),
    };
    const purchases = [purchase, ...this.load()];
    this.storage.writeLocal(key, purchases);
    this.purchasesState.set(purchases);
    return purchase;
  }

  /** Vuelve a cargar el historial desde el almacenamiento local. */
  refresh(): void {
    this.purchasesState.set(this.load());
  }

  /**
   * Lee las compras asociadas al usuario actual.
   *
   * @returns Historial almacenado o un arreglo vacío si no existe sesión.
   */
  private load(): Purchase[] {
    const key = this.storageKey();
    return key ? this.storage.readLocal<Purchase[]>(key, []) : [];
  }

  /**
   * Construye la clave utilizada para separar las compras por usuario.
   *
   * @returns Clave de almacenamiento o `null` si no existe sesión activa.
   */
  private storageKey(): string | null {
    const userKey = this.auth.userKey();
    return userKey ? `${STORAGE_PURCHASES_PREFIX}${userKey}` : null;
  }
}
