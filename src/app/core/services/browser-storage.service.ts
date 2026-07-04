import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * Abstrae el acceso seguro a `localStorage` y `sessionStorage`.
 *
 * Evita acceder a las API del navegador durante el renderizado del servidor y
 * entrega valores de respaldo cuando los datos no existen o son inválidos.
 */
@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  /** Indica si el código se está ejecutando dentro de un navegador. */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Lee y deserializa un valor desde `localStorage`.
   *
   * @param key Clave utilizada para recuperar el dato.
   * @param fallback Valor entregado cuando la lectura no es posible.
   * @returns Valor almacenado o el valor de respaldo.
   */
  readLocal<T>(key: string, fallback: T): T {
    return this.read(window => window.localStorage, key, fallback);
  }

  /**
   * Serializa y guarda un valor en `localStorage`.
   *
   * @param key Clave donde se guardará el dato.
   * @param value Valor que debe persistirse.
   */
  writeLocal<T>(key: string, value: T): void {
    this.write(window => window.localStorage, key, value);
  }

  /**
   * Traslada un valor de `localStorage` hacia una nueva clave.
   *
   * @param sourceKey Clave actualmente utilizada por el dato.
   * @param destinationKey Nueva clave donde debe conservarse.
   */
  moveLocal(sourceKey: string, destinationKey: string): void {
    if (!this.isBrowser || sourceKey === destinationKey) {
      return;
    }

    const value = window.localStorage.getItem(sourceKey);
    if (value !== null) {
      window.localStorage.setItem(destinationKey, value);
      window.localStorage.removeItem(sourceKey);
    }
  }

  /**
   * Lee y deserializa un valor desde `sessionStorage`.
   *
   * @param key Clave utilizada para recuperar el dato.
   * @param fallback Valor entregado cuando la lectura no es posible.
   * @returns Valor almacenado o el valor de respaldo.
   */
  readSession<T>(key: string, fallback: T): T {
    return this.read(window => window.sessionStorage, key, fallback);
  }

  /**
   * Serializa y guarda un valor en `sessionStorage`.
   *
   * @param key Clave donde se guardará el dato.
   * @param value Valor que debe persistirse.
   */
  writeSession<T>(key: string, value: T): void {
    this.write(window => window.sessionStorage, key, value);
  }

  /**
   * Elimina un valor del almacenamiento de sesión.
   *
   * @param key Clave que debe eliminarse.
   */
  removeSession(key: string): void {
    if (this.isBrowser) {
      window.sessionStorage.removeItem(key);
    }
  }

  /**
   * Ejecuta una lectura segura sobre el tipo de almacenamiento indicado.
   *
   * @param storage Función que selecciona el almacenamiento del navegador.
   * @param key Clave que debe leerse.
   * @param fallback Valor utilizado ante ausencia o error de lectura.
   * @returns Dato deserializado o valor de respaldo.
   */
  private read<T>(storage: (window: Window) => Storage, key: string, fallback: T): T {
    if (!this.isBrowser) {
      return fallback;
    }

    try {
      const value = storage(window).getItem(key);
      return value ? JSON.parse(value) as T : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Ejecuta una escritura segura sobre el tipo de almacenamiento indicado.
   *
   * @param storage Función que selecciona el almacenamiento del navegador.
   * @param key Clave donde se guardará el dato.
   * @param value Valor que se serializará.
   */
  private write<T>(storage: (window: Window) => Storage, key: string, value: T): void {
    if (this.isBrowser) {
      storage(window).setItem(key, JSON.stringify(value));
    }
  }
}
