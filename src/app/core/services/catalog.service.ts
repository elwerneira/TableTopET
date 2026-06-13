import { inject, Injectable, signal } from '@angular/core';

import { PRODUCT_CATALOG } from '../data/product-catalog';
import { Product } from '../models/store.models';
import { BrowserStorageService } from './browser-storage.service';

const STORAGE_PRODUCTS_KEY = 'tabletop_products';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly storage = inject(BrowserStorageService);
  private readonly productsState = signal<Product[]>(this.load());

  readonly products = this.productsState.asReadonly();

  findByName(name: string): Product | undefined {
    const normalized = this.normalize(name);
    return this.productsState().find(product =>
      [product.nombre, ...product.aliases].some(alias => this.normalize(alias) === normalized),
    );
  }

  save(products: Product[]): void {
    this.storage.writeLocal(STORAGE_PRODUCTS_KEY, products);
    this.productsState.set(products);
  }

  reduceStock(items: { id: string; cantidad: number }[]): void {
    const products = this.productsState().map(product => {
      const item = items.find(current => current.id === product.id);
      return item ? { ...product, stock: product.stock - item.cantidad } : product;
    });
    this.save(products);
  }

  private load(): Product[] {
    const stored = this.storage.readLocal<Product[]>(STORAGE_PRODUCTS_KEY, []);
    return stored.length ? stored : PRODUCT_CATALOG.map(product => ({ ...product }));
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
