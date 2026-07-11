import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { PRODUCT_CATALOG } from '../data/product-catalog';
import { Product } from '../models/store.models';
import { BrowserStorageService } from './browser-storage.service';
import { ProductJsonServerService } from './product-json-server.service';

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

  /** API local que contiene el inventario administrable. */
  private readonly productApi = inject(ProductJsonServerService);

  /** Evita llamadas HTTP al inventario durante el renderizado del servidor. */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Estado interno mutable que contiene los productos. */
  private readonly productsState = signal<Product[]>(this.load());

  /** Catálogo observable de solo lectura utilizado por las vistas. */
  readonly products = this.productsState.asReadonly();

  constructor() {
    this.loadRemoteInventory();
  }

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
   * Sincroniza el catálogo con la API REST local al iniciar la aplicación.
   * Si json-server no está disponible, se mantiene el catálogo local para
   * que las páginas públicas sigan siendo navegables.
   */
  private loadRemoteInventory(): void {
    if (!this.isBrowser) {
      return;
    }

    this.productApi.getProducts().subscribe({
      next: products => this.save(products),
      error: () => undefined,
    });
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
   * Cuando el panel administrativo guarda productos desde la API REST, ese
   * inventario pasa a ser la fuente de datos de las categorías. Por ello no
   * se mezclan productos estáticos con el inventario almacenado.
   *
   * @returns Productos disponibles para inicializar el servicio.
   */
  private load(): Product[] {
    const stored = this.storage.readLocal<Product[]>(STORAGE_PRODUCTS_KEY, []);
    if (!stored.length) {
      return PRODUCT_CATALOG.map(product => ({ ...product }));
    }

    return stored;
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
