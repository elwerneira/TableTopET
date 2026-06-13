import { inject, Injectable, signal } from '@angular/core';

import { CartItem, Purchase } from '../models/store.models';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';

const STORAGE_PURCHASES_PREFIX = 'tabletop_purchases_';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(BrowserStorageService);
  private readonly purchasesState = signal<Purchase[]>(this.load());

  readonly purchases = this.purchasesState.asReadonly();

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

  refresh(): void {
    this.purchasesState.set(this.load());
  }

  private load(): Purchase[] {
    const key = this.storageKey();
    return key ? this.storage.readLocal<Purchase[]>(key, []) : [];
  }

  private storageKey(): string | null {
    const userKey = this.auth.userKey();
    return userKey ? `${STORAGE_PURCHASES_PREFIX}${userKey}` : null;
  }
}
