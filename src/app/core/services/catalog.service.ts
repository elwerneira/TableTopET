import { inject, Injectable, signal } from '@angular/core';

import { PRODUCT_CATALOG } from '../data/product-catalog';
import { Product } from '../models/store.models';
import { BrowserStorageService } from './browser-storage.service';

/** Clave utilizada para conservar el catálogo modificado. */
const STORAGE_PRODUCTS_KEY = 'tabletop_products';

/**
 * Mantiene el catálogo de productos disponible en la aplicación.
 *
 * Inicializa los productos desde datos estáticos y conserva los cambios de
 * stock o administración en el almacenamiento local.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  /** Acceso seguro al almacenamiento local del navegador. */
  private readonly storage = inject(BrowserStorageService);

  /** Estado interno mutable que contiene los productos. */
  private readonly productsState = signal<Product[]>(this.load());

  /** Catálogo observable de solo lectura utilizado por las vistas. */
  readonly products = this.productsState.asReadonly();

  /**
   * Busca un producto utilizando su nombre principal o cualquiera de sus alias.
   *
   * @param name Nombre ingresado para realizar la búsqueda.
   * @returns Producto encontrado o `undefined` cuando no existe coincidencia.
   */
  findByName(name: string): Product | undefined {
    const normalized = this.normalize(name);
    return this.productsState().find(product =>
      [product.nombre, ...product.aliases].some(alias => this.normalize(alias) === normalized),
    );
  }

  /**
   * Guarda un nuevo estado completo del catálogo.
   *
   * @param products Productos que se almacenarán y publicarán.
   */
  save(products: Product[]): void {
    this.storage.writeLocal(STORAGE_PRODUCTS_KEY, products);
    this.productsState.set(products);
  }

  /**
   * Descuenta del catálogo las unidades incluidas en una compra.
   *
   * @param items Identificadores de producto y cantidades que deben descontarse.
   */
  reduceStock(items: { id: string; cantidad: number }[]): void {
    const products = this.productsState().map(product => {
      const item = items.find(current => current.id === product.id);
      return item ? { ...product, stock: product.stock - item.cantidad } : product;
    });
    this.save(products);
  }

  /**
   * Obtiene el catálogo almacenado o crea una copia de los datos iniciales.
   *
   * @returns Productos disponibles para inicializar el servicio.
   */
  private load(): Product[] {
    const stored = this.storage.readLocal<Product[]>(STORAGE_PRODUCTS_KEY, []);
    if (!stored.length) {
      return PRODUCT_CATALOG.map(product => ({ ...product }));
    }

    const storedIds = new Set(stored.map(product => product.id));
    const newProducts = PRODUCT_CATALOG
      .filter(product => !storedIds.has(product.id))
      .map(product => ({ ...product }));

    return [...stored, ...newProducts];
  }

  /**
   * Normaliza un texto para realizar comparaciones sin espacios ni mayúsculas.
   *
   * @param value Texto que será normalizado.
   * @returns Texto preparado para comparación.
   */
  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
