import { computed, inject, Injectable, signal } from '@angular/core';

import { CartItem, StoreActionResult } from '../models/store.models';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';
import { CatalogService } from './catalog.service';
import { PurchaseService } from './purchase.service';

/** Prefijo utilizado para separar el carrito de cada usuario. */
const STORAGE_CART_PREFIX = 'tabletop_cart_';

/**
 * Gestiona el carrito asociado al usuario que mantiene una sesión activa.
 *
 * El servicio permite agregar productos, modificar cantidades, calcular totales
 * y confirmar compras utilizando el catálogo y el almacenamiento del navegador.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  /** Servicio utilizado para identificar al usuario activo. */
  private readonly auth = inject(AuthService);

  /** Servicio utilizado para consultar productos y actualizar su stock. */
  private readonly catalog = inject(CatalogService);

  /** Servicio encargado de registrar las compras confirmadas. */
  private readonly purchases = inject(PurchaseService);

  /** Acceso seguro al almacenamiento local del navegador. */
  private readonly storage = inject(BrowserStorageService);

  /** Estado interno mutable de los productos del carrito. */
  private readonly itemsState = signal<CartItem[]>(this.load());

  /** Productos que contiene actualmente el carrito. */
  readonly items = this.itemsState.asReadonly();

  /** Valor total calculado a partir del precio y cantidad de cada producto. */
  readonly total = computed(() => this.itemsState().reduce((total, item) => total + item.precio * item.cantidad, 0));

  /** Cantidad total de unidades presentes en el carrito. */
  readonly quantity = computed(() => this.itemsState().reduce((total, item) => total + item.cantidad, 0));

  /**
   * Agrega al carrito una unidad del producto identificado por su nombre o alias.
   *
   * @param name Nombre o alias del producto seleccionado.
   * @returns Resultado de la operación y mensaje para mostrar al usuario.
   */
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

  /**
   * Aumenta o disminuye la cantidad de un producto sin superar su stock.
   *
   * @param id Identificador del producto.
   * @param delta Variación que se aplicará a la cantidad actual.
   * @returns No retorna un valor; actualiza el carrito almacenado.
   */
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

  /**
   * Elimina un producto del carrito.
   *
   * @param id Identificador del producto que se eliminará.
   * @returns No retorna un valor; persiste el carrito actualizado.
   */
  remove(id: string): void {
    this.save(this.load().filter(item => item.id !== id));
  }

  /** Vacía todos los productos del carrito actual. */
  clear(): void {
    this.save([]);
  }

  /**
   * Confirma la compra si todos los productos tienen stock disponible.
   *
   * Al completar la operación registra la compra, descuenta el stock y limpia
   * el carrito.
   *
   * @returns Resultado de la confirmación y mensaje descriptivo.
   */
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

  /** Vuelve a cargar el carrito desde el almacenamiento del navegador. */
  refresh(): void {
    this.itemsState.set(this.load());
  }

  /**
   * Lee los productos guardados para el usuario autenticado.
   *
   * @returns Productos almacenados o un arreglo vacío si no existe sesión.
   */
  private load(): CartItem[] {
    const key = this.storageKey();
    return key ? this.storage.readLocal<CartItem[]>(key, []) : [];
  }

  /**
   * Persiste y publica el estado actualizado del carrito.
   *
   * @param items Productos que deben quedar almacenados.
   */
  private save(items: CartItem[]): void {
    const key = this.storageKey();
    if (key) {
      this.storage.writeLocal(key, items);
      this.itemsState.set(items.map(item => ({ ...item })));
    }
  }

  /**
   * Construye la clave de almacenamiento correspondiente al usuario actual.
   *
   * @returns Clave del carrito o `null` cuando no existe una sesión activa.
   */
  private storageKey(): string | null {
    const userKey = this.auth.userKey();
    return userKey ? `${STORAGE_CART_PREFIX}${userKey}` : null;
  }
}
