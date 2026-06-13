import { computed, inject, Injectable, signal } from '@angular/core';

import { CartItem, StoreActionResult } from '../models/store.models';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';
import { CatalogService } from './catalog.service';
import { PurchaseService } from './purchase.service';

const STORAGE_CART_PREFIX = 'tabletop_cart_';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly purchases = inject(PurchaseService);
  private readonly storage = inject(BrowserStorageService);
  private readonly itemsState = signal<CartItem[]>(this.load());

  readonly items = this.itemsState.asReadonly();
  readonly total = computed(() => this.itemsState().reduce((total, item) => total + item.precio * item.cantidad, 0));
  readonly quantity = computed(() => this.itemsState().reduce((total, item) => total + item.cantidad, 0));

  addByName(name: string): StoreActionResult {
    if (!this.auth.session()) {
      return { ok: false, message: 'Debes iniciar sesion para agregar productos al carrito.', requiresLogin: true };
    }

    const product = this.catalog.findByName(name);
    if (!product) {
      return { ok: false, message: 'No se encontro el producto seleccionado.' };
    }
    if (product.estado !== 'activo' || product.stock <= 0) {
      return { ok: false, message: 'Este producto no tiene stock disponible.' };
    }

    const items = this.load();
    const current = items.find(item => item.id === product.id);
    if (current && current.cantidad >= product.stock) {
      return { ok: false, message: `Solo quedan ${product.stock} unidades disponibles.` };
    }

    if (current) {
      current.cantidad += 1;
    } else {
      items.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        precioOriginal: product.precioOriginal,
        imagen: product.imagen,
        categoria: product.categoria,
        oferta: product.oferta,
        cantidad: 1,
      });
    }
    this.save(items);
    return { ok: true, message: `${product.nombre} fue agregado al carrito.` };
  }

  changeQuantity(id: string, delta: number): void {
    const items = this.load();
    const item = items.find(current => current.id === id);
    const product = this.catalog.products().find(current => current.id === id);
    if (!item || !product) {
      return;
    }

    item.cantidad += delta;
    if (item.cantidad <= 0) {
      this.remove(id);
      return;
    }
    item.cantidad = Math.min(item.cantidad, product.stock);
    this.save(items);
  }

  remove(id: string): void {
    this.save(this.load().filter(item => item.id !== id));
  }

  clear(): void {
    this.save([]);
  }

  checkout(): StoreActionResult {
    const items = this.load();
    if (!items.length) {
      return { ok: false, message: 'El carrito esta vacio.' };
    }

    const unavailable = items.find(item => {
      const product = this.catalog.products().find(current => current.id === item.id);
      return !product || product.estado !== 'activo' || product.stock < item.cantidad;
    });
    if (unavailable) {
      return { ok: false, message: `No hay stock suficiente para completar la compra de ${unavailable.nombre}.` };
    }

    this.purchases.add(items);
    this.catalog.reduceStock(items);
    this.clear();
    return { ok: true, message: 'Compra confirmada correctamente.' };
  }

  refresh(): void {
    this.itemsState.set(this.load());
  }

  private load(): CartItem[] {
    const key = this.storageKey();
    return key ? this.storage.readLocal<CartItem[]>(key, []) : [];
  }

  private save(items: CartItem[]): void {
    const key = this.storageKey();
    if (key) {
      this.storage.writeLocal(key, items);
      this.itemsState.set(items.map(item => ({ ...item })));
    }
  }

  private storageKey(): string | null {
    const userKey = this.auth.userKey();
    return userKey ? `${STORAGE_CART_PREFIX}${userKey}` : null;
  }
}
