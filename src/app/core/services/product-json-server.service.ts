import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../models/store.models';

/** Endpoint local expuesto por json-server para la actividad de Semana 8. */
const PRODUCTS_API_URL = 'http://localhost:3000/productos';

/**
 * Consume productos desde json-server usando operaciones REST reales.
 *
 * Este servicio permite demostrar GET, POST, PUT y DELETE contra `db.json`,
 * separando la lógica HTTP del componente que muestra el CRUD.
 */
@Injectable({ providedIn: 'root' })
export class ProductJsonServerService {
  /** Cliente HTTP utilizado para comunicarse con json-server. */
  private readonly http = inject(HttpClient);

  /**
   * Obtiene todos los productos almacenados en `db.json`.
   *
   * @returns Observable con el listado de productos.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(PRODUCTS_API_URL);
  }

  /**
   * Crea un producto nuevo mediante POST.
   *
   * @param product Producto que se agregará al archivo `db.json`.
   * @returns Observable con el producto creado.
   */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(PRODUCTS_API_URL, product);
  }

  /**
   * Reemplaza los datos de un producto existente mediante PUT.
   *
   * @param id Identificador del producto a actualizar.
   * @param product Datos actualizados del producto.
   * @returns Observable con el producto actualizado.
   */
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${PRODUCTS_API_URL}/${id}`, product);
  }

  /**
   * Elimina un producto existente mediante DELETE.
   *
   * @param id Identificador del producto a eliminar.
   * @returns Observable vacío al completar la eliminación.
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${PRODUCTS_API_URL}/${id}`);
  }
}
